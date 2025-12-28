'use server';

import {
  answerLaneFlow,
  type AnswerLaneInput,
} from '@/ai/flows/answer-lane-flow';

export async function runAnswerLane(input: AnswerLaneInput) {
  return await answerLaneFlow(input);
}
