import type { I18nInstance } from "@repo/i18n";
import type { TRPCProcedureBuilder } from "@trpc/server";
import type {
  inferParser,
  MutationProcedure,
  Parser,
  QueryProcedure,
  UnsetMarker,
} from "@trpc/server/unstable-core-do-not-import";
import type { ManagedRuntime } from "effect";
import { Effect, Schema } from "effect";
import { isTaggedError, mapDomainErrorToTRPC } from "./services/errors";

type IntersectIfDefined<TType, TWith> = TType extends UnsetMarker
  ? TWith
  : TWith extends UnsetMarker
    ? TType
    : TType & TWith;

type DefaultValue<TValue, TFallback> = TValue extends UnsetMarker ? TFallback : TValue;

type EffectProcedureResolverOptions<TContext, TInput> = {
  readonly batchIndex?: number;
  readonly ctx: TContext;
  readonly input: TInput;
  readonly path: string;
  readonly signal: AbortSignal | undefined;
};

type ResolverContext<TContext, TContextOverrides> = TContext & TContextOverrides;

type ResolverInput<TInputOut> = TInputOut extends UnsetMarker ? undefined : TInputOut;

type TRPCResolverOptions<TContext, TInput> = EffectProcedureResolverOptions<TContext, TInput>;

export type EffectProcedureBuilder<
  TContext,
  TMeta,
  TContextOverrides,
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
  TRuntimeRequirements,
> = {
  input<TParser extends Parser>(
    schema: TParser,
  ): EffectProcedureBuilder<
    TContext,
    TMeta,
    TContextOverrides,
    IntersectIfDefined<TInputIn, inferParser<TParser>["in"]>,
    IntersectIfDefined<TInputOut, inferParser<TParser>["out"]>,
    TOutputIn,
    TOutputOut,
    TRuntimeRequirements
  >;
  output<TParser extends Parser>(
    schema: TParser,
  ): EffectProcedureBuilder<
    TContext,
    TMeta,
    TContextOverrides,
    TInputIn,
    TInputOut,
    IntersectIfDefined<TOutputIn, inferParser<TParser>["in"]>,
    IntersectIfDefined<TOutputOut, inferParser<TParser>["out"]>,
    TRuntimeRequirements
  >;
  query<TOutput, TError, TRequirements>(
    resolver: (
      opts: EffectProcedureResolverOptions<
        ResolverContext<TContext, TContextOverrides>,
        ResolverInput<TInputOut>
      >,
    ) => Effect.Effect<TOutput, TError, TRequirements>,
  ): QueryProcedure<{
    input: DefaultValue<TInputIn, void>;
    output: DefaultValue<TOutputOut, TOutput>;
    meta: TMeta;
  }>;
  mutation<TOutput, TError, TRequirements>(
    resolver: (
      opts: EffectProcedureResolverOptions<
        ResolverContext<TContext, TContextOverrides>,
        ResolverInput<TInputOut>
      >,
    ) => Effect.Effect<TOutput, TError, TRequirements>,
  ): MutationProcedure<{
    input: DefaultValue<TInputIn, void>;
    output: DefaultValue<TOutputOut, TOutput>;
    meta: TMeta;
  }>;
};

type CatalogContext = {
  readonly i18n?: I18nInstance;
};

const getI18nFromContext = (ctx: unknown, path: string): I18nInstance => {
  if (typeof ctx === "object" && ctx !== null && "i18n" in ctx) {
    const i18n = (ctx as CatalogContext).i18n;
    if (i18n) {
      return i18n;
    }
  }

  throw new Error(`[tRPC] ${path} missing i18n in context`);
};

const isInterruptedRequest = (error: unknown, signal: AbortSignal | undefined) =>
  signal?.aborted === true ||
  (error instanceof Error &&
    (error.name === "AbortError" || error.message === "All fibers interrupted without error"));

const runEffectProcedure = async <A, E, R>(
  runtime: ManagedRuntime.ManagedRuntime<R, unknown>,
  effect: Effect.Effect<A, E, R>,
  opts: TRPCResolverOptions<unknown, unknown>,
): Promise<A> => {
  try {
    return await runtime.runPromise(Effect.withSpan(opts.path)(effect), {
      signal: opts.signal,
    });
  } catch (error) {
    if (isInterruptedRequest(error, opts.signal)) {
      throw error;
    }

    if (isTaggedError(error)) {
      throw mapDomainErrorToTRPC(error, getI18nFromContext(opts.ctx, opts.path));
    }

    throw error;
  }
};

export const schemaToParser = <S extends Schema.Decoder<unknown, never>>(
  schema: S,
): Parser & { _input: S["Type"]; _output: S["Type"] } =>
  ({
    parse: (input: unknown): S["Type"] => Schema.decodeUnknownSync(schema)(input),
    _input: {} as S["Type"],
    _output: {} as S["Type"],
  }) as Parser & { _input: S["Type"]; _output: S["Type"] };

export const createEffectProcedure = <
  TContext,
  TMeta,
  TContextOverrides,
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
  TRuntimeRequirements,
>(
  procedure: TRPCProcedureBuilder<
    TContext,
    TMeta,
    TContextOverrides,
    TInputIn,
    TInputOut,
    TOutputIn,
    TOutputOut,
    false
  >,
  runtime: ManagedRuntime.ManagedRuntime<TRuntimeRequirements, unknown>,
): EffectProcedureBuilder<
  TContext,
  TMeta,
  TContextOverrides,
  TInputIn,
  TInputOut,
  TOutputIn,
  TOutputOut,
  TRuntimeRequirements
> => ({
  input<TParser extends Parser>(schema: TParser) {
    type NewInputIn = IntersectIfDefined<TInputIn, inferParser<TParser>["in"]>;
    type NewInputOut = IntersectIfDefined<TInputOut, inferParser<TParser>["out"]>;

    return createEffectProcedure<
      TContext,
      TMeta,
      TContextOverrides,
      NewInputIn,
      NewInputOut,
      TOutputIn,
      TOutputOut,
      TRuntimeRequirements
    >(
      procedure.input(
        schema as unknown as Parameters<typeof procedure.input>[0],
      ) as TRPCProcedureBuilder<
        TContext,
        TMeta,
        TContextOverrides,
        NewInputIn,
        NewInputOut,
        TOutputIn,
        TOutputOut,
        false
      >,
      runtime,
    );
  },

  output<TParser extends Parser>(schema: TParser) {
    type NewOutputIn = IntersectIfDefined<TOutputIn, inferParser<TParser>["in"]>;
    type NewOutputOut = IntersectIfDefined<TOutputOut, inferParser<TParser>["out"]>;

    return createEffectProcedure<
      TContext,
      TMeta,
      TContextOverrides,
      TInputIn,
      TInputOut,
      NewOutputIn,
      NewOutputOut,
      TRuntimeRequirements
    >(
      procedure.output(schema as Parameters<typeof procedure.output>[0]) as TRPCProcedureBuilder<
        TContext,
        TMeta,
        TContextOverrides,
        TInputIn,
        TInputOut,
        NewOutputIn,
        NewOutputOut,
        false
      >,
      runtime,
    );
  },

  query<TOutput, TError, TRequirements>(
    resolver: (
      opts: EffectProcedureResolverOptions<
        ResolverContext<TContext, TContextOverrides>,
        ResolverInput<TInputOut>
      >,
    ) => Effect.Effect<TOutput, TError, TRequirements>,
  ) {
    return procedure.query(
      (opts) =>
        runEffectProcedure(
          runtime,
          resolver(
            opts as EffectProcedureResolverOptions<
              ResolverContext<TContext, TContextOverrides>,
              ResolverInput<TInputOut>
            >,
          ) as unknown as Effect.Effect<TOutput, TError, TRuntimeRequirements>,
          opts,
        ) as Promise<DefaultValue<TOutputIn, TOutput>>,
    );
  },

  mutation<TOutput, TError, TRequirements>(
    resolver: (
      opts: EffectProcedureResolverOptions<
        ResolverContext<TContext, TContextOverrides>,
        ResolverInput<TInputOut>
      >,
    ) => Effect.Effect<TOutput, TError, TRequirements>,
  ) {
    return procedure.mutation(
      (opts) =>
        runEffectProcedure(
          runtime,
          resolver(
            opts as EffectProcedureResolverOptions<
              ResolverContext<TContext, TContextOverrides>,
              ResolverInput<TInputOut>
            >,
          ) as unknown as Effect.Effect<TOutput, TError, TRuntimeRequirements>,
          opts,
        ) as Promise<DefaultValue<TOutputIn, TOutput>>,
    );
  },
});
