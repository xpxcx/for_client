"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = require("fs");
const core_1 = require("@nestjs/core");
const cookieParser = require('cookie-parser');
const path_1 = require("path");
const app_module_1 = require("./app.module");
const uploadsDirs = [
    (0, path_1.join)(process.cwd(), 'uploads', 'achievements'),
    (0, path_1.join)(process.cwd(), 'uploads', 'profile'),
    (0, path_1.join)(process.cwd(), 'uploads', 'materials'),
];
uploadsDirs.forEach((dir) => {
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
});
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    const helmet = await import('helmet');
    app.use(helmet.default({ contentSecurityPolicy: false }));
    const corsOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    if (process.env.FRONTEND_ORIGIN) {
        corsOrigins.push(process.env.FRONTEND_ORIGIN);
    }
    app.enableCors({
        origin: corsOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map