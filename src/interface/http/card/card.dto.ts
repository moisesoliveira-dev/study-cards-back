import { IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Min, MinLength, ArrayMinSize } from 'class-validator';

export class CreateCardDto {
  @IsUUID()
  topicId!: string;

  @IsString()
  @MinLength(1)
  front!: string;

  @IsString()
  @MinLength(1)
  back!: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  front?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  back?: string;

  @IsOptional()
  @IsString()
  hint?: string | null;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(['NEW', 'REVIEW', 'KNOWN'])
  status?: 'NEW' | 'REVIEW' | 'KNOWN';

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class MergeCardsDto {
  @IsUUID()
  topicId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  sourceCardIds!: string[];

  @IsString()
  @MinLength(1)
  front!: string;

  @IsString()
  @MinLength(1)
  back!: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
