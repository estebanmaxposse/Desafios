import { Context } from "../deps.ts";
import type { Color, ColorArray } from "../types/color.ts";

const path = "database.txt";
const encoder = new TextEncoder();

export const addColor = async (ctx: Context) => {
  const body = ctx.request.body();
  if (!body.type || !body.value) {
    ctx.response.status = 400;
    ctx.response.body = "Invalid request body.";
    return;
  }

  if (body.type !== "text") {
    ctx.response.status = 400;
    ctx.response.body = "Invalid request body type. Expected text.";
    return;
  }

  const item: Color = await body.value;

  try {
    const data = await Deno.readTextFile(path);
    const items: ColorArray = JSON.parse(data);
    items.push(item);
    await Deno.writeTextFile(path, JSON.stringify(items));
    ctx.response.body = await Deno.readTextFile(path);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      const file = await Deno.create(path);
      await Deno.writeFile(path, encoder.encode(JSON.stringify([item])));
      file.close();
      ctx.response.body = await Deno.readTextFile(path);
    } else {
      ctx.response.status = 500;
      ctx.response.body = "Error reading file.";
    }
  }
};

export const getColors = async (ctx: Context) => {
  try {
    const fileContent = await Deno.readFile(path);
    const text = new TextDecoder().decode(fileContent);

    ctx.response.body = text;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      const file = await Deno.create(path);
      await Deno.writeFile(path, encoder.encode("[]"));
      file.close();
      const data = await Deno.readTextFile(path);
      ctx.response.body = data;
    } else {
      ctx.response.status = 500;
      ctx.response.body = "Error reading file.";
    }
  }
};
