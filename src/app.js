// ===========================
// Inne 主应用逻辑
// ===========================

(function() {
  // === 状态 ===
  let currentCharacter = null;
  let conversationHistory = [];
  let isStreaming = false;

  // === DOM 元素 ===
  const $ = id => document.getElementById(id);
  const characterList = $('characterList');
  const messages = $('messages');
  const emptyState = $('emptyState');
  const inputBox = $('inputBox');
  const sendBtn = $('sendBtn');
  const settingsBtn = $('settingsBtn');
  const settingsModal = $('settingsModal');
  const closeSettingsBtn = $('closeSettingsBtn');
  const saveSettingsBtn = $('saveSettingsBtn');
  const clearChatBtn = $('clearChatBtn');
  const addCharacterBtn = $('addCharacterBtn');
  const addCharacterModal = $('addCharacterModal');
  const closeAddCharBtn = $('closeAddCharBtn');
  const cancelAddCharBtn = $('cancelAddCharBtn');
  const confirmAddCharBtn = $('confirmAddCharBtn');
  const charAvatar = $('charAvatar');
  const charName = $('charName');
  const charDesc = $('charDesc');
  const modelType = $('modelType');
  const apiKeyInput = $('apiKeyInput');
  const baseUrlInput = $('baseUrlInput');
  const modelNameInput = $('modelNameInput');
  const baseUrlGroup = $('baseUrlGroup');

  // === 初始化 ===
  function init() {
    renderCharacterList();
    loadSettings();
    bindEvents();
    // 尝试恢复上次会话
    restoreSession();
  }

  // === 渲染角色列表 ===
  function renderCharacterList() {
    const chars = loadCharacters();
    characterList.innerHTML = '';

    chars.forEach(char => {
      const item = document.createElement('div');
      item.className = `char-item${char.isBuiltIn ? '' : ' custom-tag'}${currentCharacter?.id === char.id ? ' active' : ''}`;
      item.dataset.id = char.id;

      const avatarUrl = char.avatar || getDefaultAvatar(char.id);

      item.innerHTML = `
        <img class="char-item-avatar" src="${avatarUrl}" alt="${char.name}">
        <div class="char-item-info">
          <div class="char-item-name">${char.name}</div>
          <div class="char-item-desc">${char.description}</div>
        </div>
        ${!char.isBuiltIn ? '<button class="char-item-delete" title="删除">🗑</button>' : ''}
      `;

      item.addEventListener('click', e => {
        if (e.target.classList.contains('char-item-delete')) {
          e.stopPropagation();
          if (confirm(`确定删除角色「${char.name}」？`)) {
            deleteCustomCharacter(char.id);
            renderCharacterList();
          }
          return;
        }
        selectCharacter(char);
      });

      characterList.appendChild(item);
    });
  }

  // === 选择角色 ===
  function selectCharacter(char) {
    currentCharacter = char;
    conversationHistory = [];

    // 更新 UI
    charName.textContent = char.name;
    charDesc.textContent = char.description;
    charAvatar.src = char.avatar || getDefaultAvatar(char.id);
    charAvatar.style.display = '';

    messages.innerHTML = '';
    emptyState.style.display = '';

    // 激活状态
    document.querySelectorAll('.char-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === char.id);
    });

    // 保存会话
    saveSession();

    // 聚焦输入框
    inputBox.focus();
  }

  // === 发送消息 ===
  async function sendMessage() {
    if (isStreaming || !currentCharacter) return;

    const content = inputBox.value.trim();
    if (!content) return;

    // 清空输入框
    inputBox.value = '';
    inputBox.style.height = 'auto';

    // 添加用户消息
    addMessage('user', content);
    conversationHistory.push({ role: 'user', content });

    // 开始流式响应
    isStreaming = true;
    sendBtn.disabled = true;
    emptyState.style.display = 'none';

    const assistantMsg = addMessage('assistant', '', true);

    // 构建请求消息（含系统提示）
    const requestMessages = [
      { role: 'system', content: currentCharacter.systemPrompt },
      ...conversationHistory
    ];

    await API.streamChat(
      requestMessages,
      chunk => {
        assistantMsg.bubble.textContent += chunk;
        scrollToBottom();
      },
      err => {
        assistantMsg.bubble.textContent = `⚠️ ${err}`;
        assistantMsg.bubble.style.color = '#e74c3c';
      }
    );

    isStreaming = false;
    sendBtn.disabled = false;

    // 保存对话
    conversationHistory.push({ role: 'assistant', content: assistantMsg.bubble.textContent });
    saveSession();
  }

  // === 添加消息 DOM ===
  function addMessage(role, content, isLoading = false) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;

    const avatarUrl = currentCharacter?.avatar || getDefaultAvatar(currentCharacter?.id);

    msg.innerHTML = `
      <img class="msg-avatar" src="${role === 'assistant' ? avatarUrl : ''}" alt="">
      <div class="msg-bubble">${isLoading ? '<div class="msg-loading"><span></span><span></span><span></span></div>' : ''}</div>
    `;

    messages.appendChild(msg);
    scrollToBottom();

    return {
      el: msg,
      bubble: msg.querySelector('.msg-bubble')
    };
  }

  // === 滚动到底部 ===
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  // === 设置相关 ===
  function loadSettings() {
    const config = API.getConfig();
    modelType.value = config.modelType;
    apiKeyInput.value = config.apiKey;
    baseUrlInput.value = config.baseUrl;
    modelNameInput.value = config.modelName;
    updateBaseUrlGroup();
    updateModelNamePlaceholder();
  }

  function saveSettings() {
    API.saveConfig({
      modelType: modelType.value,
      apiKey: apiKeyInput.value.trim(),
      baseUrl: baseUrlInput.value.trim(),
      modelName: modelNameInput.value.trim()
    });
    updateBaseUrlGroup();
    updateModelNamePlaceholder();
    closeModal(settingsModal);
  }

  function updateBaseUrlGroup() {
    const show = modelType.value === 'custom';
    baseUrlGroup.style.display = show ? 'flex' : 'none';
    if (!show) {
      baseUrlInput.value = API.getDefaultBaseUrl(modelType.value);
    }
  }

  function updateModelNamePlaceholder() {
    const opts = API.getModelOptions(modelType.value);
    modelNameInput.placeholder = opts.length > 0 ? opts.join(', ') : '输入模型名称...';
  }

  function openModal(modal) {
    modal.classList.add('active');
  }

  function closeModal(modal) {
    modal.classList.remove('active');
  }

  // === 自定义角色 ===
  function addCustomCharacter() {
    const name = $('newCharName').value.trim();
    const desc = $('newCharDesc').value.trim();
    const avatar = $('newCharAvatar').value.trim();
    const system = $('newCharSystem').value.trim();

    if (!name || !system) {
      alert('请填写角色名称和系统提示词');
      return;
    }

    saveCustomCharacter({
      name, description: desc, avatar, systemPrompt: system
    });

    // 清空表单
    $('newCharName').value = '';
    $('newCharDesc').value = '';
    $('newCharAvatar').value = '';
    $('newCharSystem').value = '';

    closeModal(addCharacterModal);
    renderCharacterList();
  }

  // === 会话持久化 ===
  function saveSession() {
    if (!currentCharacter) return;
    localStorage.setItem('inne_current_char', JSON.stringify({
      characterId: currentCharacter.id,
      history: conversationHistory
    }));
  }

  function restoreSession() {
    try {
      const saved = localStorage.getItem('inne_current_char');
      if (!saved) return;

      const { characterId, history } = JSON.parse(saved);
      const chars = loadCharacters();
      const char = chars.find(c => c.id === characterId);
      if (!char) return;

      selectCharacter(char);
      conversationHistory = history || [];

      // 渲染历史消息
      messages.innerHTML = '';
      if (conversationHistory.length === 0) return;
      emptyState.style.display = 'none';

      conversationHistory.forEach(msg => {
        addMessage(msg.role, msg.content);
      });
    } catch (e) {
      console.warn('恢复会话失败:', e);
    }
  }

  function clearChat() {
    if (!currentCharacter) return;
    if (!confirm('确定清空当前对话？')) return;
    conversationHistory = [];
    messages.innerHTML = '';
    emptyState.style.display = '';
    localStorage.removeItem('inne_current_char');
  }

  // === 事件绑定 ===
  function bindEvents() {
    // 发送
    sendBtn.addEventListener('click', sendMessage);
    inputBox.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // 自动调整高度
    inputBox.addEventListener('input', () => {
      inputBox.style.height = 'auto';
      inputBox.style.height = Math.min(inputBox.scrollHeight, 120) + 'px';
    });

    // 设置弹窗
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    closeSettingsBtn.addEventListener('click', () => closeModal(settingsModal));
    settingsModal.addEventListener('click', e => {
      if (e.target === settingsModal) closeModal(settingsModal);
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    clearChatBtn.addEventListener('click', clearChat);

    // 模型切换
    modelType.addEventListener('change', () => {
      updateBaseUrlGroup();
      updateModelNamePlaceholder();
    });

    // 添加角色弹窗
    addCharacterBtn.addEventListener('click', () => openModal(addCharacterModal));
    closeAddCharBtn.addEventListener('click', () => closeModal(addCharacterModal));
    cancelAddCharBtn.addEventListener('click', () => closeModal(addCharacterModal));
    confirmAddCharBtn.addEventListener('click', addCustomCharacter);
    addCharacterModal.addEventListener('click', e => {
      if (e.target === addCharacterModal) closeModal(addCharacterModal);
    });
  }

  // === 启动 ===
  init();
})();
