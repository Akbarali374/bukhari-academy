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
      console.log('⚠️ GitHub Gist sozlanmagan')
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

      if (response.ok) {
        console.log('✅ GitHub Gist\'ga saqlandi')
        return true
      } else {
        console.error('❌ GitHub Gist xatosi:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ GitHub Gist xatosi:', error)
      return false
    }
  }

  async loadFromGist(): Promise<any | null> {
    if (!this.config.gistId || !this.config.githubToken) {
      console.log('⚠️ GitHub Gist sozlanmagan')
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
          const data = JSON.parse(file.content)
          console.log('✅ GitHub Gist\'dan yuklandi')
          return data
        }
      } else {
        console.error('❌ GitHub Gist xatosi:', response.status)
      }
    } catch (error) {
      console.error('❌ GitHub Gist xatosi:', error)
    }

    return null
  }

  isConfigured(): boolean {
    return !!(this.config.gistId && this.config.githubToken)
  }
}

export const persistentStorage = new PersistentStorage()
