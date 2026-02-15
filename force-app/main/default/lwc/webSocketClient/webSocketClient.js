import { LightningElement } from 'lwc'
import { loadScript } from 'lightning/platformResourceLoader'
import WS from '@salesforce/resourceUrl/ws'

export default class WebSocketClient extends LightningElement {
  ws
  connected = false

  async connectedCallback() {
    try {
      await loadScript(this, WS)
      this.ws = new WebSocket('ws://localhost:8080')

      this.ws.addEventListener('open', () => {
        this.connected = true
      })

      this.ws.addEventListener('message', (event) => {
        console.log(`Received message: ${event.data}`)
      })

      this.ws.addEventListener('close', () => {
        this.connected = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  handleSend(event) {
    event.preventDefault()

    const messageInput = this.template.querySelector('.message-input')
    const message = messageInput.value

    if (this.connected && message.trim() !== '') {
      this.ws.send(message)
    }

    messageInput.value = ''
  }
}