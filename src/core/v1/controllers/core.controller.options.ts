import type { ControllerOptions as Options } from "@nestjs/common";

const ControllerOptions: Options = {
	path: "core",
	version: "1",

	// The following are the default options
	host: undefined,
	scope: undefined,
	durable: undefined,
};

export { ControllerOptions };
