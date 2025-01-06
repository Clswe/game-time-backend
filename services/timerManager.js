class TimeManager {
  constructor() {
    this.activeTimers = new Map();
  }

  /**
   * Inicia o timer para o jogador ou entidade identificada.
   * @param {string} entityId - Identificador único do jogador.
   * @param {number} durationInSeconds - Duração do timer em segundos.
   * @param {function} onTimerEnd - Callback executado ao final do timer.
   */
  startTimer(entityId, durationInSeconds, onTimerEnd) {
    if (!entityId || typeof entityId !== 'string') {
      throw new Error('O ID da entidade deve ser uma string válida.');
    }

    if (typeof durationInSeconds !== 'number' || durationInSeconds <= 0) {
      throw new Error('A duração deve ser um número positivo.');
    }

    if (typeof onTimerEnd !== 'function') {
      throw new Error('O callback deve ser uma função.');
    }

    
    this.clearTimer(entityId);

    const timer = setTimeout(() => {
      onTimerEnd(entityId);
      this.activeTimers.delete(entityId);
    }, durationInSeconds * 1000);

    this.activeTimers.set(entityId, timer);
  }

  /**
   * @param {string} entityId - Identificador único do jogador ou entidade.
   */
  clearTimer(entityId) {
    if (!this.activeTimers.has(entityId)) return;

    clearTimeout(this.activeTimers.get(entityId));
    this.activeTimers.delete(entityId);
  }

  /**
   * Cancela todos os timers ativos.
   */
  clearAllTimers() {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }

  /**
   * @param {string} entityId - Identificador único do jogado.
   * @returns {boolean} - Retorna `true` se o timer estiver ativo, caso contrário `false`.
   */
  isTimerActive(entityId) {
    return this.activeTimers.has(entityId);
  }
}

module.exports = new TimeManager();
