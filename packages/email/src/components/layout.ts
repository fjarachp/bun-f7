import { Body, Container, Head, Html, Preview } from "react-email";
import { createElement, type CSSProperties, type ReactNode } from "react";
import type { Locale } from "../locale";

type EmailLayoutProps = {
  children?: ReactNode;
  locale: Locale;
  preview: string;
};

const mainStyle: CSSProperties = {
  backgroundColor: "#f6f7f9",
  color: "#1f2937",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
};

const containerStyle: CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "32px 20px",
};

export function EmailLayout({ children, locale, preview }: EmailLayoutProps) {
  return createElement(
    Html,
    { lang: locale },
    createElement(Head),
    createElement(Preview, null, preview),
    createElement(
      Body,
      { style: mainStyle },
      createElement(Container, { style: containerStyle }, children),
    ),
  );
}
