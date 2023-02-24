import pTimeout from 'p-timeout';
import { v4 as uuidv4 } from 'uuid';

import { fetchSSE } from './fetchSSE';
import * as types from './types';

export class ChatGPTUnofficialProxyAPI {
  protected _accessToken: string;
  protected _apiReverseProxyUrl: string;
  protected _debug: boolean;
  protected _model: string;
  protected _headers: Record<string, string>;

  /**
   * @param fetch - Optional override for the `fetch` implementation to use. Defaults to the global `fetch` function.
   */
  constructor(opts: {
    accessToken: string;

    /** @defaultValue `https://chat.openai.com/backend-api/conversation` **/
    apiReverseProxyUrl?: string;

    /** @defaultValue `text-davinci-002-render-sha` **/
    model?: string;

    /** @defaultValue `false` **/
    debug?: boolean;

    /** @defaultValue `undefined` **/
    headers?: Record<string, string>;

    fetch?: types.FetchFn;
  }) {
    const {
      accessToken,
      apiReverseProxyUrl = 'https://chat.openai.com/backend-api/conversation',
      model = 'text-davinci-002-render-sha',
      debug = false,
      headers,
    } = opts;

    this._accessToken = accessToken;
    this._apiReverseProxyUrl = apiReverseProxyUrl;
    this._debug = !!debug;
    this._model = model;
    this._headers = headers ?? {};

    if (!this._accessToken) {
      throw new Error('ChatGPT invalid accessToken');
    }
  }

  get accessToken(): string {
    return this._accessToken;
  }

  set accessToken(value: string) {
    this._accessToken = value;
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If you want your response to have historical context, you must provide a valid `parentMessageId`.
   *
   * If you want to receive a stream of partial responses, use `opts.onProgress`.
   * If you want to receive the full response, including message and conversation IDs,
   * you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
   * helper.
   *
   * Set `debug: true` in the `ChatGPTAPI` constructor to log more info on the full prompt sent to the OpenAI completions API. You can override the `promptPrefix` and `promptSuffix` in `opts` to customize the prompt.
   *
   * @param message - The prompt message to send
   * @param opts.conversationId - Optional ID of a conversation to continue (defaults to a random UUID)
   * @param opts.parentMessageId - Optional ID of the previous message in the conversation (defaults to `undefined`)
   * @param opts.messageId - Optional ID of the message to send (defaults to a random UUID)
   * @param opts.timeoutMs - Optional timeout in milliseconds (defaults to no timeout)
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  async sendMessage(
    text: string,
    opts: types.SendMessageBrowserOptions = {},
  ): Promise<types.ChatMessage> {
    const {
      conversationId,
      parentMessageId = uuidv4(),
      messageId = uuidv4(),
      action = 'next',
      timeoutMs,
      onProgress,
    } = opts;

    console.log(
      `🚀 ~ file: unofficial.ts:92 ~ ChatGPTUnofficialProxyAPI ~ messageId:`,
      messageId,
    );
    console.log(
      `🚀 ~ file: unofficial.ts:91 ~ ChatGPTUnofficialProxyAPI ~ parentMessageId:`,
      parentMessageId,
    );
    let { abortSignal } = opts;

    let abortController: AbortController | null = null;
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController();
      abortSignal = abortController.signal;
    }

    const body: types.ConversationJSONBody = {
      action,
      messages: [
        {
          id: messageId,
          role: 'user',
          content: {
            content_type: 'text',
            parts: [text],
          },
        },
      ],
      model: this._model,
      parent_message_id: parentMessageId,
    };

    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const result: types.ChatMessage = {
      role: 'assistant',
      id: uuidv4(),
      parentMessageId: messageId,
      conversationId,
      text: '',
    };

    const responseP = new Promise<types.ChatMessage>((resolve, reject) => {
      const url = this._apiReverseProxyUrl;
      const headers = {
        ...this._headers,
        Authorization: `Bearer ${this._accessToken}`,
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      };

      if (this._debug) {
        console.log('POST', url, { body, headers });
      }

      fetchSSE(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortSignal,
        onMessage: (data: string) => {
          console.log(
            `🚀 ~ file: unofficial.ts:213 ~ ChatGPTUnofficialProxyAPI ~ responseP ~ data:`,
            data,
          );

          if (data === '[BOT:NO_RESPONSE]') {
            return reject(new Error('No response from OpenAI'));
          }
          if (data === '[DONE]') {
            return resolve(result);
          }

          try {
            const convoResponseEvent: types.ConversationResponseEvent =
              JSON.parse(data);
            if (convoResponseEvent.conversation_id) {
              result.conversationId = convoResponseEvent.conversation_id;
            }

            if (convoResponseEvent.message?.id) {
              result.id = convoResponseEvent.message.id;
            }

            const message = convoResponseEvent.message;

            if (message) {
              const text = message?.content?.parts?.[0];

              if (text) {
                result.text = text;

                if (onProgress) {
                  onProgress(result);
                }
              }
            }
          } catch (err) {
            // ignore for now; there seem to be some non-json messages
            console.warn('fetchSSE onMessage unexpected error', err);
          }
        },
      }).catch((err) => {
        const errMessageL = err.toString().toLowerCase();
        console.log(`🚀 ~ file: unofficial.ts:203 ~ ChatGPTUnofficialProxyAPI ~ responseP ~ errMessageL:`, errMessageL);

        if (
          result.text &&
          (errMessageL === 'error: typeerror: terminated' ||
            errMessageL === 'typeerror: terminated')
        ) {
          // OpenAI sometimes forcefully terminates the socket from their end before
          // the HTTP request has resolved cleanly. In my testing, these cases tend to
          // happen when OpenAI has already send the last `response`, so we can ignore
          // the `fetch` error in this case.
          return resolve(result);
        } else {
          return reject(err);
        }
      });
    });

    if (timeoutMs) {
      if (abortController) {
        // This will be called when a timeout occurs in order for us to forcibly
        // ensure that the underlying HTTP request is aborted.
        (responseP as any).cancel = () => {
          abortController?.abort();
        };
      }

      return pTimeout(responseP, {
        milliseconds: timeoutMs,
        message: 'ChatGPT timed out waiting for response',
      });
    } else {
      return responseP;
    }
  }
}
