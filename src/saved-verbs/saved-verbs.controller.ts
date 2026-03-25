import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavedVerbsService } from './saved-verbs.service';
import { SaveVerbDto } from './save-verb.dto';

@Controller('saved-verbs')
@UseGuards(AuthGuard('jwt'))
export class SavedVerbsController {
  constructor(private savedVerbsService: SavedVerbsService) { }

  // GET /api/saved-verbs
  @Get()
  findAll(@Request() req: any) {
    return this.savedVerbsService.findAll(req.user.id);
  }

  // POST /api/saved-verbs
  @Post()
  save(@Request() req: any, @Body() dto: SaveVerbDto) {
    return this.savedVerbsService.save(req.user.id, dto);
  }

  // DELETE /api/saved-verbs/:verb
  @Delete(':verb')
  remove(@Request() req: any, @Param('verb') verb: string) {
    return this.savedVerbsService.remove(req.user.id, verb);
  }
}
