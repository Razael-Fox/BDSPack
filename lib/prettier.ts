import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";

export async function formatJson(jsonStr: string): Promise<string> {
  try {
    // Strip whitespace to validate first
    const parsed = JSON.parse(jsonStr);

    // Format using Prettier standalone
    const formatted = await prettier.format(JSON.stringify(parsed), {
      parser: "json",
      plugins: [parserBabel, parserEstree],
      tabWidth: 2,
      semi: true,
      singleQuote: false,
    });

    return formatted.trim();
  } catch {
    // If Prettier fails or JSON is invalid, return original or basic stringify format
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch {
      return jsonStr;
    }
  }
}
