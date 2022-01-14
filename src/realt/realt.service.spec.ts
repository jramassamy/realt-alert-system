import { Test, TestingModule } from '@nestjs/testing';
import { RealtService } from './realt.service';

describe('RealtService', () => {
  let service: RealtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtService],
    }).compile();

    service = module.get<RealtService>(RealtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
