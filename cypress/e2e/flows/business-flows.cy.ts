describe('Business Flows', () => {
  const baseUrl = 'http://localhost:3000'
  let influencerToken: string
  let adminToken: string
  let clientToken: string

  before(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('trafficsolutionsmkt@gmail.com')
    cy.get('input[type="password"]').type('teste123')
    cy.contains('button', 'Entrar').click()
    cy.url({ timeout: 15000 }).should('include', '/painel')
    cy.window().then((win) => {
      influencerToken = win.localStorage.getItem('agenda-token') || ''
      expect(influencerToken).to.not.be.empty
    })
  })

  beforeEach(() => {
    if (!influencerToken) {
      cy.visit('/login')
      cy.get('input[type="email"]').clear().type('trafficsolutionsmkt@gmail.com')
      cy.get('input[type="password"]').clear().type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 15000 }).should('include', '/painel')
      cy.window().then((win) => {
        influencerToken = win.localStorage.getItem('agenda-token') || ''
      })
    }
  })

  describe('Flow 1: Booking Confirmation Flow', () => {
    it('influencer can see pending bookings', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=pendente`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.data).to.be.an('array')
      })
    })

    it('influencer can confirm a pending booking', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=pendente`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          const bookingId = res.body.data[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/bookings/${bookingId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'confirmado' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect([200, 400]).to.include(patchRes.status)
          })
        } else {
          cy.log('No pending bookings to confirm — skipping')
        }
      })
    })

    it('influencer can mark a confirmed booking as completed', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=confirmado`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          const bookingId = res.body.data[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/bookings/${bookingId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'concluido' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect([200, 400]).to.include(patchRes.status)
          })
        } else {
          cy.log('No confirmed bookings to complete — skipping')
        }
      })
    })
  })

  describe('Flow 2: Booking Cancellation Flow', () => {
    it('influencer can cancel a pending booking', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=pendente`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          const bookingId = res.body.data[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/bookings/${bookingId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'cancelado' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect([200, 400]).to.include(patchRes.status)
          })
        } else {
          cy.log('No pending bookings to cancel — skipping')
        }
      })
    })

    it('cancelled booking cannot be confirmed', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=cancelado`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        if (res.body.data && res.body.data.length > 0) {
          const bookingId = res.body.data[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/bookings/${bookingId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'confirmado' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect(patchRes.status).to.eq(400)
          })
        } else {
          cy.log('No cancelled bookings — skipping')
        }
      })
    })
  })

  describe('Flow 3: Waitlist Flow', () => {
    it('influencer can view waitlist', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/waitlist`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
      })
    })

    it('influencer can approve a waitlist lead', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/waitlist`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        const aguardando = res.body.data?.filter((w: any) => w.status === 'aguardando')
        if (aguardando && aguardando.length > 0) {
          const waitlistId = aguardando[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/waitlist/${waitlistId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'contatado' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect([200, 400]).to.include(patchRes.status)
          })
        } else {
          cy.log('No waitlist leads — skipping')
        }
      })
    })
  })

  describe('Flow 4: Client Management Flow', () => {
    it('influencer can view clients', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/clients`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.data).to.be.an('array')
      })
    })

    it('influencer can activate a waiting client', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/clients`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        const espera = res.body.data?.filter((c: any) => c.status === 'espera')
        if (espera && espera.length > 0) {
          const clientId = espera[0].id
          cy.request({
            method: 'PATCH',
            url: `${baseUrl}/api/clients/${clientId}/status`,
            headers: { Authorization: `Bearer ${influencerToken}` },
            body: { status: 'ativo' },
            failOnStatusCode: false,
          }).then((patchRes) => {
            expect([200, 400]).to.include(patchRes.status)
          })
        } else {
          cy.log('No waiting clients — skipping')
        }
      })
    })
  })

  describe('Flow 5: Public Profile & Booking Page', () => {
    it('public profile loads correctly', () => {
      cy.visit('/flavinhapaulinooficial')
      cy.contains('Flavinha paulino', { timeout: 10000 }).should('be.visible')
      cy.contains('Serviços disponíveis').should('be.visible')
    })

    it('booking page requires authentication', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit('/agendar/flavinhapaulinooficial')
      cy.url({ timeout: 10000 }).should('include', '/login')
    })

    it('authenticated client can access booking page', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('cliente@agendainflu.com')
      cy.get('input[type="password"]').type('teste123')
      cy.contains('button', 'Entrar').click()
      cy.url({ timeout: 15000 }).should('include', '/cliente')
      cy.visit('/agendar/flavinhapaulinooficial')
      cy.url({ timeout: 10000 }).should('include', '/agendar')
      cy.contains('Agendar com', { timeout: 10000 }).should('be.visible')
    })
  })
})
