import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence/prisma/persistence.module';
import { HttpModule } from './interface/http/http.module';

@Module({
  imports: [PersistenceModule, HttpModule],
})
export class AppModule {}
