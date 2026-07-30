import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';

export class CreateCardDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ValidateIf((o: CreateCardDto) => Boolean(o.topicId))
  @IsUUID()
  @IsOptional()
  topicId?: string | null;

  @IsString()
  @MinLength(1)
  front!: string;

  @IsString()
  @MinLength(1)
  back!: string;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  document?: string | null;

  @IsOptional()
  @IsString()
  deckId?: string | null;

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
  document?: string | null;

  @IsOptional()
  @IsString()
  levelId?: string | null;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

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
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string | null;

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
  levelId?: string;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  document?: string | null;

  @IsOptional()
  @IsString()
  deckId?: string | null;
}

export class MoveCardDto {
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  @IsOptional()
  topicId?: string | null;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  @IsOptional()
  deckId?: string | null;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  @IsOptional()
  beforeCardId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
