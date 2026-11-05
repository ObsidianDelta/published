// validate.mjs -- a tiny, dependency-free JSON Schema subset validator, enough for
// experiment-template.schema.json (type, required, properties, additionalProperties:false,
// enum, const, pattern, min/maxLength, minimum/maximum, min/maxItems, items, local $ref,
// min/maxProperties). Returns a list of "path: problem" strings; empty = valid.

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
const typeOk = (want, v) => {
  const t = typeOf(v);
  return (Array.isArray(want) ? want : [want]).some((w) => w === t || (w === 'number' && t === 'integer'));
};

export function validate(schema, value, root = schema, path = '$') {
  if (schema.$ref) {
    const name = schema.$ref.replace('#/$defs/', '');
    return validate(root.$defs[name], value, root, path);
  }
  const errs = [];
  if (schema.type && !typeOk(schema.type, value)) return [`${path}: expected ${schema.type}, got ${typeOf(value)}`];
  if ('const' in schema && value !== schema.const) errs.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errs.push(`${path}: ${JSON.stringify(value)} not in enum`);
  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errs.push(`${path}: does not match ${schema.pattern}`);
    if (schema.minLength != null && value.length < schema.minLength) errs.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength != null && value.length > schema.maxLength) errs.push(`${path}: longer than ${schema.maxLength}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) errs.push(`${path}: < ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) errs.push(`${path}: > ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) errs.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) errs.push(`${path}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => errs.push(...validate(schema.items, v, root, `${path}[${i}]`)));
  }
  if (typeOf(value) === 'object') {
    const keys = Object.keys(value);
    if (schema.minProperties != null && keys.length < schema.minProperties) errs.push(`${path}: fewer than ${schema.minProperties} properties`);
    if (schema.maxProperties != null && keys.length > schema.maxProperties) errs.push(`${path}: more than ${schema.maxProperties} properties`);
    for (const r of schema.required || []) if (!(r in value)) errs.push(`${path}: missing ${r}`);
    const props = schema.properties || {};
    for (const k of keys) {
      if (k in props) errs.push(...validate(props[k], value[k], root, `${path}.${k}`));
      else if (schema.additionalProperties === false) errs.push(`${path}: unexpected property ${k}`);
    }
  }
  return errs;
}
