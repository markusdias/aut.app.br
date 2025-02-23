declare module 'react-syntax-highlighter' {
  import { ReactNode, CSSProperties } from 'react';

  interface StyleObject {
    [key: string]: string | number | CSSProperties | StyleObject;
  }

  interface CodeTagProps {
    style?: CSSProperties;
    className?: string;
    [key: string]: unknown;
  }

  interface LineNumberStyle extends CSSProperties {
    [key: string]: string | number | undefined;
  }

  interface LineProps {
    style?: CSSProperties;
    className?: string;
    line?: string;
    lineNumber?: number;
    [key: string]: unknown;
  }

  interface SyntaxHighlighterProps {
    children?: ReactNode;
    language?: string;
    style?: StyleObject | { [key: string]: CSSProperties };
    customStyle?: CSSProperties;
    codeTagProps?: CodeTagProps;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: LineNumberStyle;
    wrapLines?: boolean;
    lineProps?: LineProps | ((lineNumber: number) => LineProps);
  }

  export const Prism: React.FC<SyntaxHighlighterProps>;
  export const Light: React.FC<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  import { StyleObject } from 'react-syntax-highlighter';
  export const oneDark: StyleObject;
  export const oneLight: StyleObject;
  export const solarizedlight: StyleObject;
  export const tomorrow: StyleObject;
}
