describe('Bookings, Clients & Waitlist', () => {
  const baseUrl = 'http://localhost:3000'
  let influencerToken: string

  before(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('trafficsolutionsmkt@gmail.com')
    cy.get('input[type="password"]').type('teste123')
    cy.contains('button', 'Entrar').click()
    cy.url({ timeout: 15000 }).should('include', '/painel')
    cy.window().then((win) => {
      influencerToken = win.localStorage.getItem('agenda-token') || ''
    })
  })

  describe('GET /api/bookings', () => {
    it('should return 200 or 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings`,
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 401]).to.include(res.status)
      })
    })

    it('should return bookings for influencer', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
      })
    })

    it('should filter bookings by status', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/bookings?status=confirmado`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body.data).to.be.an('array')
      })
    })
  })

  describe('POST /api/bookings', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/bookings`,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return 400 with invalid data', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/bookings`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        body: { influencer_id: 'invalido' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('PATCH /api/bookings/[id]/status', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/bookings/00000000-0000-0000-0000-000000000000/status`,
        body: { status: 'confirmado' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return 400 with invalid status transition', () => {
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
            body: { status: 'pendente' },
            failOnStatusCode: false,
          }).then((statusRes) => {
            expect(statusRes.status).to.eq(400)
          })
        }
      })
    })
  })

  describe('GET /api/clients', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/clients`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return clients for influencer', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/clients`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('data')
        expect(res.body.data).to.be.an('array')
      })
    })
  })

  describe('PATCH /api/clients/[id]/status', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/clients/00000000-0000-0000-0000-000000000000/status`,
        body: { status: 'ativo' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return 400 with invalid status', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/clients/00000000-0000-0000-0000-000000000000/status`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        body: { status: 'status-invalido' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('POST /api/waitlist', () => {
    it('should return 400 with missing fields', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/waitlist`,
        body: { nome: 'Teste' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('GET /api/waitlist', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/waitlist`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return waitlist for influencer', () => {
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
  })

  describe('PATCH /api/waitlist/[id]/status', () => {
    it('should return 401 without token', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/waitlist/00000000-0000-0000-0000-000000000000/status`,
        body: { status: 'contatado' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401)
      })
    })

    it('should return 400 or 404 with invalid status or id', () => {
      cy.request({
        method: 'PATCH',
        url: `${baseUrl}/api/waitlist/00000000-0000-0000-0000-000000000000/status`,
        headers: { Authorization: `Bearer ${influencerToken}` },
        body: { status: 'status-invalido' },
        failOnStatusCode: false,
      }).then((res) => {
        expect([400, 404]).to.include(res.status)
      })
    })
  })
})
