// ===========================
// Inne AI API 调用封装
// ===========================

const API = {
  // 获取配置
  getConfig() {
    return {
      modelType: localStorage.getItem('inne_model_type') || 'openai',
      apiKey: localStorage.getItem('inne_api_key') || '',
      baseUrl: localStorage.getItem('inne_base_url') || '',
      modelName: localStorage.getItem('inne_model_name') || ''
    };
  },

  // 保存配置
  saveConfig(config) {
    localStorage.setItem('inne_model_type', config.modelType);
    localStorage.setItem('inne_api_key', config.apiKey);
    localStorage.setItem('inne_base_url', config.baseUrl);
    localStorage.setItem('inne_model_name', config.modelName);
  },

  // 构建请求
  buildRequest(modelType, modelName, messages, apiKey, baseUrl) {
    if (modelType === 'openai' || modelType === 'minimax' || modelType === 'custom') {
      return {
        url: `${baseUrl}/chat/completions`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: {
          model: modelName || (modelType === 'minimax' ? 'MiniMax-M2.7' : 'gpt-4o-mini'),
          messages: messages,
          stream: true
        }
      };
    } else if (modelType === 'anthropic') {
      // Anthropic 使用 /v1/messages，system 是单独字段
      const systemMsg = messages.find(m => m.role === 'system');
      const nonSystem = messages.filter(m => m.role !== 'system');
      return {
        url: `${baseUrl}/v1/messages`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: {
          model: modelName || 'claude-3-5-haiku-latest',
          system: systemMsg ? systemMsg.content : undefined,
          messages: nonSystem.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 4096,
          stream: true
        }
      };
    }
  },

  // 流式调用
  async streamChat(messages, onChunk, onError) {
    const config = this.getConfig();
    const { modelType, apiKey, baseUrl, modelName } = config;

    if (!apiKey) {
      onError('请先在设置中配置 API Key');
      return;
    }

    const req = this.buildRequest(
      modelType,
      modelType === 'minimax' ? 'MiniMax-M2.7' : (modelName || 'gpt-4o-mini'),
      messages,
      apiKey,
      baseUrl || this.getDefaultBaseUrl(modelType)
    );

    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API 错误 (${response.status}): ${err}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          // 去掉 "data: " 前缀
          const dataStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            const content = this.extractContent(modelType, data);
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略解析错误，可能是截断的 JSON
          }
        }
      }
    } catch (err) {
      onError(err.message || '请求失败，请检查 API Key 和网络连接');
    }
  },

  // 提取内容（处理不同 API 格式）
  extractContent(modelType, data) {
    if (modelType === 'anthropic') {
      // Anthropic 流式: data.type = 'content_block_delta', data.delta.text
      if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
        return data.delta.text;
      }
    } else {
      // OpenAI / MiniMax: data.choices[0].delta.content
      if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
        return data.choices[0].delta.content;
      }
    }
    return null;
  },

  // 获取默认 baseUrl
  getDefaultBaseUrl(modelType) {
    const defaults = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com',
      minimax: 'https://api.minimax.chat/v1',
      custom: ''
    };
    return defaults[modelType] || '';
  },

  // 获取模型列表
  getModelOptions(modelType) {
    const models = {
      openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
      minimax: ['MiniMax-M2.7'],
      custom: []
    };
    return models[modelType] || [];
  }
};
