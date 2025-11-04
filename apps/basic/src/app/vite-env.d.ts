// b_path:: apps/basic/src/app/vite-env.d.ts
/// <reference types="vite/client" />

declare module "webgl-fluid";

declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}
