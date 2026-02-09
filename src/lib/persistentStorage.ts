// Doimiy saqlash tizimi - GitHub Gist orqali
// Bu ma'lumotlarni butun umr saqlaydi

interface PersistentConfig {
  gistId?: string
  githubToken?: string
}

class PersistentStorage {
  private config: PersistentConfig = {}
  
  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    try {
      const stored = localStorage.getItem('bukhari_persistent_config')
      if (stored) {
        this.config = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Config yuklashda xato:', error)
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem('bukhari_persistent_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('Config saqlashda xato:', error)
    }
  }

  setConfig(gistId: string, githubToken: string) {
    this.config = { gistId, githubToken }
    this.saveConfig()
  }

  async saveToGist(data: any): Promise<boolean> {
    if (!this.config.gistId || !this.config.githubToken) {
      return false
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.config.githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'bukhari-academy-db.json': {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  async loadFromGist(): Promise<any | null> {
    if (!this.config.gistId || !this.config.githubToken) {
      return null
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        headers: {
          'Authorization': `token ${this.config.githubToken}`
        }
      })

      if (response.ok) {
        const gist = await response.json()
        const file = gist.files['bukhari-academy-db.json']
        if (file && file.content) {
          return JSON.parse(file.content)
        }
      }
    } catch (error) {
      // Silent fail
    }

    return null
  }

  isConfigured(): boolean {
    return !!(this.config.gistId && this.config.githubToken)
  }
}

export const persistentStorage = new PersistentStorage()
