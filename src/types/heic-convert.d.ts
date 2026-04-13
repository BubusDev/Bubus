declare module "heic-convert" {
  type ConvertInput = {
    buffer: Buffer | Uint8Array | ArrayBuffer;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  type ConvertAllResult = {
    convert: () => Promise<Uint8Array>;
  };

  function convert(input: ConvertInput): Promise<Uint8Array>;

  namespace convert {
    function all(input: ConvertInput): Promise<ConvertAllResult[]>;
  }

  export = convert;
}
