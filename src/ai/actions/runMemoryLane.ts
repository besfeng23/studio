'use server';

import {
  memoryLaneFlow,
  type MemoryLaneInput,
} from '@/ai/flows/memory-lane-flow';

export async function runMemoryLane(input: MemoryLaneInput) {
  return await memoryLaneFlow(input);
}
