import {
    Completion,
    CompletionContext,
    CompletionResult,
    snippetCompletion,
} from "@codemirror/autocomplete";

interface SuggestionInterface {
    label: string;
    apply: string;
    detail: string;
    type: string;
    info: string | null;
    enum?: string[];
}

interface PropertyValueInterface {
    type?: string;
    description?: string;
    schemaId?: string;
    enum?: string[];
    properties?: Record<string, PropertyValueInterface>;
    items?: PropertyValueInterface;
    anyOf?: PropertyValueInterface[];
}
export function jsonCompletions(
    context: CompletionContext,
    completionsArray: Completion[],
): CompletionResult | null {
    const word: { from: number; to: number; text: string } | null = context.matchBefore(/"?\$?\w*/);
    const inputValue = context.state.toJSON().doc.replace(/\n/g, " ");
    if (!word) return null;
    if (word.from === word.to && !context.explicit) return null;

    // This check determines whether the user is currently typing an object key.
    // If the last non-space character before the current word is a left curly brace ({) or a comma (,),
    // then the user is still typing the key and the check will pass.
    // Otherwise, if the last non-space character is not a left curly brace or comma,
    // then the key has already been entered and this check will stop execution.
    const inputWithoutNewWord = inputValue.slice(0, word.from).replace(/ /g, "");
    const lastSymbol = inputWithoutNewWord[inputWithoutNewWord.length - 1];
    if (!(lastSymbol === "{" || lastSymbol === ",")) return null;

    const symbolAfterWord = inputValue[word.to];

    return {
        from: word.from,
        // this is a workaround for the fact that the completion library will auto-close the quote
        // if the user is typing a key and the key is not already quoted
        // it will remove redundant quote if the key is already quoted
        to: symbolAfterWord === '"' ? word.to + 1 : word.to,
        options: completionsArray.map((item) => {
            const apply = item.apply as string;

            return snippetCompletion(apply, item);
        }),
    };
}

/**
 * @summary Function to get fields suggestions based on entity schema structure.
 * @param {Object} schema - Entity schema describing document structure.
 * @param {String} prefix - Prefix added to label when prepare nested fields.
 * @param {Array} suggestions - Array of suggestions formed from schema fields.
 */
export function getFieldsSuggestions(
    schema: { properties?: Record<string, PropertyValueInterface> },
    prefix: string,
    suggestions: SuggestionInterface[],
): SuggestionInterface[] {
    if (!schema) return [];
    const { properties } = schema;

    if (!properties) {
        return [];
    }

    Object.entries(properties).forEach(([key, value]: [string, PropertyValueInterface]) => {
        const suggestion: SuggestionInterface = {
            label: `"${prefix}${key}"`,
            apply: `"${prefix}${key}": "#{1}"`,
            detail: `${value.type}`,
            type: "variable",
            info: value.description || null,
        };

        if (value.type === "string" || value.type === "number" || value.type === "boolean") {
            suggestions.push(suggestion);
            return;
        }

        if (!value.type && value.enum) {
            const noTypeSuggestion: SuggestionInterface = {
                ...suggestion,
                detail: "string",
                enum: value.enum,
            };
            suggestions.push(noTypeSuggestion);
            return;
        }

        if (value.schemaId && value.properties) {
            return getFieldsSuggestions(value, `${prefix}${key}.`, suggestions);
        }

        if (value.type === "array" && value?.items) {
            if (value.items?.schemaId)
                return getFieldsSuggestions(value.items, `${prefix}${key}.`, suggestions);
            if (value.items?.anyOf)
                return value.items.anyOf.forEach((item) => {
                    if (!item.schemaId) return;
                    return getFieldsSuggestions(item, `${prefix}${key}.`, suggestions);
                });
        }
    });

    return suggestions;
}

/**
 * @summary Combines an array of suggestions by their label, removing duplicates and merging enum values.
 * @function
 * @param {SuggestionInterface[]} suggestions - An array of suggestion objects.
 * @returns {SuggestionInterface[]} - An array of unique suggestions.
 *
 * @typedef {Object} SuggestionInterface
 * @property {string} label - The suggestion label.
 * @property {string} apply - The text to insert if the suggestion is selected.
 * @property {string} detail - A description of the suggestion.
 * @property {string} type - The suggestion type.
 * @property {string} info - Additional information about the suggestion.
 * @property {string[]} [enum] - An array of enum values for the suggestion, if applicable.
 */
export function combineByLabel(suggestions: SuggestionInterface[]): SuggestionInterface[] {
    const suggestionsByLabel: { [key: string]: SuggestionInterface } = {};
    suggestions.forEach((obj) => {
        const { label } = obj;
        if (suggestionsByLabel[label]) {
            const currentEnum = suggestionsByLabel[label].enum;
            const incomingEnum = obj.enum || [];
            if (currentEnum) {
                suggestionsByLabel[label].enum = Array.from(
                    new Set([...incomingEnum, ...currentEnum]),
                );
            }
        } else {
            suggestionsByLabel[label] = { ...obj };
        }
    });

    return Object.values(suggestionsByLabel).map((suggestion) => {
        if (suggestion.enum) {
            suggestion.info = `Could be: ${suggestion.enum.join(", ")}`;
        }
        return suggestion;
    });
}
