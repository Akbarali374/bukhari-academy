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
    
    // API'ga ham saqlash
    this.syncConfigToAPI()
  }

  loadConfigFromData(config: PersistentConfig) {
    this.config = config
    this.saveConfig()
  }

  private async syncConfigToAPI() {
    try {
      // Global database'ga qo'shish
      const stored = localStorage.getItem('bukhari_global_db')
      if (stored) {
        const db = JSON.parse(stored)
        db.persistentConfig = this.config
        localStorage.setItem('bukhari_global_db', JSON.stringify(db))
        
        // API'ga yuborish
        const API_URL = '/api/database'
        const API_KEY = 'bukhari_academy_secret_2024_sanobarhon'
        
        await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify(db)
        })
      }
    } catch (error) {
      console.error('Config sync xatosi:', error)
    }
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

      // Faqat 404 xatosida warning berish, boshqa xatolarni ignore qilish
      if (!response.ok && response.status === 404) {
        // Silent - faqat birinchi marta warning
        if (!sessionStorage.getItem('gist_404_warned')) {
          console.warn('⚠️ GitHub Gist topilmadi. Admin panelda "Doimiy saqlash" sahifasidan sozlang.')
          sessionStorage.setItem('gist_404_warned', 'true')
        }
      }

      return response.ok
    } catch (error) {
      // Butunlay silent - hech narsa chiqarmaymiz
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
      // Butunlay silent - hech narsa chiqarmaymiz
    }

    return null
  }

  isConfigured(): boolean {
    return !!(this.config.gistId && this.config.githubToken)
  }
}

export const persistentStorage = new PersistentStorage()
