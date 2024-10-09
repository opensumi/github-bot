import { render } from '../renderer';
import { ExtractPayload } from '../types';

import { StopHandleError, TemplateRenderResult } from './components';

export async function handleStar(
  payload: ExtractPayload<'star'>,
): Promise<TemplateRenderResult> {
  const repository = payload.repository;
  const starCount = repository.stargazers_count;
  if (starCount % 100 === 0) {
    return {
      title: '⭐⭐⭐',
      text: render(
        `Good news, {{repository|link}} now has ${starCount} 🌟s.`,
        payload,
      ),
    };
  }

  throw new StopHandleError('no need to send');
}
