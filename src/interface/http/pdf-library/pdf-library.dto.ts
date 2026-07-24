import {
  IsBoolean,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const cleanOptionalText = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

export class CreatePdfGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Transform(({ value }) => String(value ?? '').trim())
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  @Transform(cleanOptionalText)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdatePdfGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Transform(cleanOptionalText)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  @Transform(cleanOptionalText)
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UploadPdfDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(cleanOptionalText)
  title?: string;

  @IsOptional()
  @IsString()
  groupId?: string;
}

export class UpdatePdfDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Transform(cleanOptionalText)
  title?: string;

  @IsOptional()
  @IsString()
  groupId?: string | null;

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;
}
