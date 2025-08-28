import type {
	InfoObject,
	TagObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

type SwaggerDocumentBuilderOptions = InfoObject;

type Tags = TagObject;

export type { SwaggerDocumentBuilderOptions, Tags };
