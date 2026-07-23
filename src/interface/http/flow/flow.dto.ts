import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFlowBoardDto {
  @IsString()
  @MinLength(1)
  subjectId!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}

export class UpdateFlowBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsArray()
  nodes?: unknown[];

  @IsOptional()
  @IsArray()
  edges?: unknown[];
}
