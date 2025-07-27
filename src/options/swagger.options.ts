import { InfoObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

const SwaggerOptions: InfoObject = {
	title: "Ember",
	description: "Ember's API descriptions & Services",
	version: "1.0.0",
	// termsOfService: "https://ember.com/terms-of-service",
	// contact: {
	// 	name: "Ember Team",
	// 	email: "contact@ember.com",
	// 	url: "https://ember.com/contact",
	// },
	license: {
		name: "MIT License",
		url: "https://opensource.org/licenses/MIT",
	},
};

export { SwaggerOptions };
