import { Test, TestingModule } from '@nestjs/testing';
import { ExpresswaysService } from './expressways.service';

describe('ExpresswaysService', () => {
  let service: ExpresswaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpresswaysService],
    }).compile();

    service = module.get<ExpresswaysService>(ExpresswaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
