import { Module } from '@nestjs/common';
import { SavedVerbsController } from './saved-verbs.controller';
import { SavedVerbsService } from './saved-verbs.service';

@Module({
  controllers: [SavedVerbsController],
  providers: [SavedVerbsService],
})
export class SavedVerbsModule {}
