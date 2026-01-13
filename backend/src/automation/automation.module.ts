import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [VaultModule],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
