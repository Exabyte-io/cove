import { autocompletion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { StreamLanguage } from "@codemirror/language";
import { fortran } from "@codemirror/legacy-modes/mode/fortran";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { linter, lintGutter } from "@codemirror/lint";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ConsistencyCheck } from "@exabyte-io/code.js/dist/types";
import CodeMirrorBase, { BasicSetupOptions, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import React, { RefObject } from "react";

import { linterGenerator } from "./utils/exaxyz_linter";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LANGUAGES_MAP: Record<string, any> = {
    python: [python()],
    shell: [StreamLanguage.define(shell)],
    fortran: [StreamLanguage.define(fortran)],
    jinja2: [StreamLanguage.define(jinja2)],
    javascript: [javascript()],
    json: [json(), lintGutter(), linter(jsonParseLinter())],
};

export interface CodeMirrorProps {
    updateContent: (content: string) => void;
    updateOnFirstLoad: boolean;
    content?: string;
    options: boolean | BasicSetupOptions;
    language: string;
    completions: (context: CompletionContext) => CompletionResult;
    theme?: "light" | "dark";
    onFocus?: () => void;
    onBlur?: () => void;
    checks?: { checks: ConsistencyCheck[] };
    readOnly?: boolean;
}

export interface CodeMirrorState {
    content: string;
    isLoaded: boolean;
    isEditing: boolean;
    extensions: unknown[];
}

class CodeMirror extends React.Component<CodeMirrorProps, CodeMirrorState> {
    codeMirrorRef: RefObject<ReactCodeMirrorRef> = React.createRef();

    constructor(props: CodeMirrorProps) {
        super(props);
        this.state = {
            content: props.content || "",
            isLoaded: false,
            isEditing: false,
            extensions: this.createExtensions(),
        };
        this.handleContentChange = this.handleContentChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    componentDidUpdate(prevProps: CodeMirrorProps) {
        const { checks } = this.props;
        if (checks !== prevProps.checks) {
            const consistencyChecks = checks?.checks || [];
            this.setState({ extensions: this.createExtensions(consistencyChecks) }, () => {
                this.codeMirrorRef.current?.editor?.blur();
            });
        }
    }

    /*
     * editor - CodeMirror object https://uiwjs.github.io/react-codemirror/
     * viewUpdate - object containing the update to the editor tree structure
     */
    handleContentChange(newContent: string) {
        const { isLoaded, content, isEditing } = this.state;
        const { updateContent, updateOnFirstLoad = true } = this.props;
        // kludge for the way state management is handled in web-app
        // TODO: RESTORE whatever was removed here!!!!
        if (!isLoaded && !updateOnFirstLoad) {
            this.setState({ isLoaded: true });
            return;
        }
        // update content only if component is focused
        // Otherwise content is being marked as edited when selecting a flavor in workflow designer!

        if (content === newContent) return;
        this.setState({ content: newContent }, () => {
            if (isEditing && updateContent) updateContent(newContent);
        });
    }

    handleFocus() {
        const { onFocus } = this.props;
        if (onFocus) onFocus();
        this.setState({ isEditing: true });
    }

    handleBlur() {
        const { onBlur } = this.props;
        if (onBlur) onBlur();
        this.setState({ isEditing: false });
    }

    createExtensions(checks?: ConsistencyCheck[]) {
        const { completions, language } = this.props;
        const completionExtension = autocompletion({ override: [completions] });
        const languageExtensions = LANGUAGES_MAP[language]
            ? LANGUAGES_MAP[language]
            : LANGUAGES_MAP.fortran;

        if (checks) {
            const linterExtension = linterGenerator(checks);
            return [completionExtension, linter(linterExtension), ...languageExtensions];
        }

        return [completionExtension, ...languageExtensions];
    }

    render() {
        const { options = {}, theme, readOnly, content } = this.props;
        const { extensions } = this.state;

        return (
            <CodeMirrorBase
                key={content}
                ref={this.codeMirrorRef}
                value={content || ""}
                // @ts-ignore
                onChange={(value: string) => {
                    this.handleContentChange(value);
                }}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                basicSetup={options}
                theme={theme || "light"}
                // @ts-ignore
                extensions={extensions}
                readOnly={readOnly}
            />
        );
    }
}

export default CodeMirror;
