import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserConversationService } from './user-conversation.service';
import { CreateUserConversationDto } from './dto/create-user-conversation.dto';
import { UpdateUserConversationDto } from './dto/update-user-conversation.dto';

@Controller('user/:loggedId/conversation/:conversationId')
export class UserConversationController {
  constructor(private readonly userConversationService: UserConversationService) {}

  @Post()
  create(@Body() createUserConversationDto: CreateUserConversationDto) {
    return this.userConversationService.create(createUserConversationDto);
  }

  @Post('adicionar')
  addUser(@Param('loggedId') loggedId: string, @Param('conversationId') conversationId: string, @Body() createUserConversationDto: CreateUserConversationDto) {
    return this.userConversationService.addUser(+loggedId, +conversationId, createUserConversationDto);
  }

  @Patch('remover/:deleteId')
  deleteUser(@Param('loggedId') loggedId: string, @Param('conversationId') conversationId: string, @Param('deleteId') deleteId: string) {
    return this.userConversationService.deleteUser(+loggedId, +conversationId, +deleteId);
  }
  
  @Get()
  findAll() {
    return this.userConversationService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userConversationService.findOne(+id);
  // }

  @Patch()
  update(@Param('loggedId') loggedId: string, @Param('conversationId') conversationId: string, @Body() updateUserConversationDto: UpdateUserConversationDto) {
    return this.userConversationService.update(+loggedId, +conversationId, updateUserConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userConversationService.remove(+id);
  }
}
