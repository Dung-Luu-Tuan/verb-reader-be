import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SaveVerbDto {
  @IsNumber()
  id: number;

  @IsString()
  verb: string;

  @IsString()
  @IsOptional()
  phonetic?: string;

  @IsString()
  meaning: string;

  @IsString()
  exampleEn: string;

  @IsString()
  exampleVi: string;
}
