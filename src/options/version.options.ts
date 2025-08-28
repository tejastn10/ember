import { type VersioningOptions as Options, VersioningType } from "@nestjs/common";

const VersioningOptions: Options = {
	type: VersioningType.URI,
	prefix: "api/v",
};

export { VersioningOptions };
