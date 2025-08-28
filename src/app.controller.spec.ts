import { TerminusModule } from "@nestjs/terminus";
import { Test, type TestingModule } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { TelemetryService } from "./telemetry/telemetry.service";

describe("AppController", () => {
	let appController: AppController;

	beforeEach(async () => {
		const mockTelemetryService = {
			register: {
				metrics: jest.fn().mockResolvedValue("mock metrics"),
			},
		};

		const app: TestingModule = await Test.createTestingModule({
			imports: [TerminusModule],
			controllers: [AppController],
			providers: [
				{
					provide: TelemetryService,
					useValue: mockTelemetryService,
				},
			],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe("root", () => {
		it("should return Machine Status", () => {
			const status = appController.main();

			expect(status).toEqual("Server running");
		});
	});
});
