import { Test, TestingModule } from '@nestjs/testing';
import { ExpresswaysController } from './expressways.controller';

describe('ExpresswaysController', () => {
  let controller: ExpresswaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpresswaysController],
    }).compile();

    controller = module.get<ExpresswaysController>(ExpresswaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
