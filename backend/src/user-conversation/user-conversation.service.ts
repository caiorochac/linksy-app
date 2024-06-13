import { Injectable } from '@nestjs/common';
import { CreateUserConversationDto } from './dto/create-user-conversation.dto';
import { UpdateUserConversationDto } from './dto/update-user-conversation.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserConversationService {
  constructor(private prisma: PrismaService) {}

  async create(createUserConversationDto: CreateUserConversationDto) {
    return await this.prisma.userConversation.create({
      data: createUserConversationDto,
      include:{
        user: {
          select:{
            username: true
          }
        }
      }
    });
  }

  async addUser(loggedId: number, conversationId: number, createUserConversationDto: CreateUserConversationDto) {
    let isOwner = await this.prisma.userConversation.findUnique({
      select:{
        owner: true
      },
      where:{
        userId_conversationId:{
          conversationId: conversationId,
          userId: loggedId
        }
      }
    });
    
    if (isOwner.owner == true) {
      //gets all users usernames to be added
      let ids = await Promise.all(createUserConversationDto.ids.map(id => this.prisma.user.findUnique({
        where:{
          id: id
        },
        select:{
          id: true,
          username: true
        }
      })));

      return ids.map(id => this.prisma.$transaction([
        //add each user
        this.prisma.userConversation.upsert({
          where:{
            userId_conversationId:{
              conversationId: conversationId,
              userId: loggedId
            }
          },
          update:{
            leftConversation: false
          },
          create:{
            userId: id.id,
            conversationId: conversationId
          },
        }),
        //send a message in conversation that indicates the user has been added
        this.prisma.message.create({
          data: {
            content: "'" + id.username + "' foi adicionado ao grupo.",
            senderId: 0,
            conversationId: conversationId
          }
        })
      ]));
    }
  }

  async deleteUser(loggedId: number, conversationId: number, deleteId: number) {
    let isOwner = await this.prisma.userConversation.findUnique({
      select:{
        owner: true
      },
      where:{
        userId_conversationId:{
          conversationId: conversationId,
          userId: loggedId
        }
      }
    });
    
    if (isOwner.owner == true || loggedId == deleteId) {
      //gets user's username do be deleted
      let userToDelete = await this.prisma.user.findUnique({
        where:{
          id: deleteId
        },
        select:{
          id: true,
          username: true
        }
      });

      return this.prisma.$transaction([
        //delete each user
        this.prisma.userConversation.update({
          where:{
            userId_conversationId:{
              conversationId: conversationId,
              userId: loggedId
            }
          },
          data:{
            leftConversation: true
          }
        }),
        //send a message in conversation that indicates the user has been deleted
        this.prisma.message.create({
          data: {
            content: "'" + userToDelete.username + "' foi removido do grupo.",
            senderId: 0,
            conversationId: conversationId
          }
        })
      ]);
    }
  }
  
  async findAll() {
    return `This action returns all userConversation`;
  }

  async findOne(userId: number, conversationId: number) {
    return await this.prisma.userConversation.findUnique(
      {
        where:{
          userId_conversationId: {
            userId: userId,
            conversationId: conversationId
          }
        },
        include: {
          conversation: true
        }
      }
    );
  }

  async update(userId: number, conversationId: number, updateUserConversationDto: UpdateUserConversationDto) {
    return this.prisma.userConversation.update({
      where:{
        userId_conversationId: {
          userId: userId,
          conversationId: conversationId
        } 
      },
      data: updateUserConversationDto,
    });
  }

  async remove(id: number) {
    return `This action removes a #${id} userConversation`;
  }
}
