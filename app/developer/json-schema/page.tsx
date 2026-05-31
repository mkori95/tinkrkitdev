"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { InputArea } from "@/components/InputArea";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, CheckCircle } from "lucide-react";

const tool = TOOLS.find((t) => t.slug === "json-schema")!;

type SchemaError = string;

function validate(data: unknown, schema: Record<string, unknown>, path = "root"): SchemaError[] {
  const errors: SchemaError[] = [];

  if (schema.type) {
    const expectedType = schema.type as string;
    const actualType = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
    if (actualType !== expectedType) {
      errors.push(`${path}: expected type "${expectedType}", got "${actualType}"`);
      return errors;
    }
  }

  if (schema.enum) {
    const enumVals = schema.enum as unknown[];
    if (!enumVals.some((v) => JSON.stringify(v) === JSON.stringify(data))) {
      errors.push(`${path}: value ${JSON.stringify(data)} is not one of [${enumVals.map((v) => JSON.stringify(v)).join(", ")}]`);
    }
  }

  if (typeof data === "string") {
    if (typeof schema.minLength === "number" && data.length < schema.minLength) {
      errors.push(`${path}: string length ${data.length} is less than minLength ${schema.minLength}`);
    }
    if (typeof schema.maxLength === "number" && data.length > schema.maxLength) {
      errors.push(`${path}: string length ${data.length} exceeds maxLength ${schema.maxLength}`);
    }
    if (schema.pattern) {
      try {
        const re = new RegExp(schema.pattern as string);
        if (!re.test(data)) errors.push(`${path}: string does not match pattern "${schema.pattern}"`);
      } catch {
        errors.push(`${path}: invalid pattern "${schema.pattern}"`);
      }
    }
  }

  if (typeof data === "number") {
    if (typeof schema.minimum === "number" && data < schema.minimum) {
      errors.push(`${path}: ${data} is less than minimum ${schema.minimum}`);
    }
    if (typeof schema.maximum === "number" && data > schema.maximum) {
      errors.push(`${path}: ${data} exceeds maximum ${schema.maximum}`);
    }
    if (typeof schema.multipleOf === "number" && data % schema.multipleOf !== 0) {
      errors.push(`${path}: ${data} is not a multiple of ${schema.multipleOf}`);
    }
  }

  if (Array.isArray(data)) {
    if (typeof schema.minItems === "number" && data.length < schema.minItems) {
      errors.push(`${path}: array has ${data.length} items, minimum is ${schema.minItems}`);
    }
    if (typeof schema.maxItems === "number" && data.length > schema.maxItems) {
      errors.push(`${path}: array has ${data.length} items, maximum is ${schema.maxItems}`);
    }
    if (schema.items && typeof schema.items === "object") {
      data.forEach((item, i) => {
        errors.push(...validate(item, schema.items as Record<string, unknown>, `${path}[${i}]`));
      });
    }
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;

    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required as string[]) {
        if (!(field in obj)) {
          errors.push(`${path}: missing required field "${field}"`);
        }
      }
    }

    if (schema.properties && typeof schema.properties === "object") {
      const props = schema.properties as Record<string, Record<string, unknown>>;
      for (const [key, subSchema] of Object.entries(props)) {
        if (key in obj) {
          errors.push(...validate(obj[key], subSchema, `${path}.${key}`));
        }
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      const allowedKeys = Object.keys(schema.properties as object);
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.includes(key)) {
          errors.push(`${path}: additional property "${key}" is not allowed`);
        }
      }
    }
  }

  return errors;
}

const EXAMPLE_DATA = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com"
}`;

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "age"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string"
    }
  }
}`;

export default function JsonSchemaPage() {
  const [dataInput, setDataInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [errors, setErrors] = useState<SchemaError[] | null>(null);
  const [parseError, setParseError] = useState("");

  function handleValidate() {
    setParseError("");
    setErrors(null);

    let data: unknown;
    let schema: Record<string, unknown>;

    try {
      data = JSON.parse(dataInput);
    } catch (e) {
      setParseError("Invalid JSON in data: " + (e as Error).message);
      return;
    }

    try {
      schema = JSON.parse(schemaInput);
    } catch (e) {
      setParseError("Invalid JSON in schema: " + (e as Error).message);
      return;
    }

    const result = validate(data, schema);
    setErrors(result);
  }

  function loadExample() {
    setDataInput(EXAMPLE_DATA);
    setSchemaInput(EXAMPLE_SCHEMA);
    setErrors(null);
    setParseError("");
  }

  function clear() {
    setDataInput("");
    setSchemaInput("");
    setErrors(null);
    setParseError("");
  }

  const isValid = errors !== null && errors.length === 0;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <InputArea
            value={dataInput}
            onChange={setDataInput}
            label="JSON Data"
            placeholder='{"name": "Alice", "age": 30}'
            accept=".json,.txt"
            maxSizeBytes={5242880}
            rows={12}
          />
          <InputArea
            value={schemaInput}
            onChange={setSchemaInput}
            label="JSON Schema"
            placeholder='{"type": "object", "required": ["name"], "properties": {...}}'
            accept=".json,.txt"
            maxSizeBytes={5242880}
            rows={12}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleValidate} disabled={!dataInput.trim() || !schemaInput.trim()}>
            Validate
          </Button>
          <Button variant="outline" size="sm" onClick={loadExample}>
            Load example
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} className="ml-auto">
            Clear
          </Button>
        </div>

        {parseError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {parseError}
          </div>
        )}

        {errors !== null && (
          <div className={`rounded-lg border ${isValid ? "border-green-500/40 bg-green-500/10" : "border-destructive/30 bg-destructive/5"} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-4 py-3 ${isValid ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
              {isValid ? (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Valid — JSON matches the schema</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{errors.length} validation error{errors.length !== 1 ? "s" : ""} found</span>
                </>
              )}
            </div>

            {errors.length > 0 && (
              <div className="border-t border-border divide-y divide-border/50">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                    <span className="shrink-0 text-xs text-muted-foreground pt-0.5">#{i + 1}</span>
                    <span className="font-mono text-sm text-destructive">{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {errors === null && !parseError && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Supported validations</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
              <span>type (string, number, boolean, object, array, null)</span>
              <span>required fields</span>
              <span>properties (recursive)</span>
              <span>enum values</span>
              <span>minLength / maxLength</span>
              <span>minimum / maximum</span>
              <span>pattern (regex for strings)</span>
              <span>minItems / maxItems</span>
              <span>multipleOf</span>
              <span>additionalProperties: false</span>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
