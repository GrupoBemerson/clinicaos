import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ScheduleModal from '../components/ScheduleModal'
import DetailsModal from '../components/ConsultaDetailsModal'

const localizer = momentLocalizer(moment)

export default function Agenda() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/consultas')
    const data = await res.json()
    setEvents(data.map((c: any) => ({
      id: c.id,
      title: `${c.pacienteId} - ${c.status}`,
      start: new Date(c.data_hora),
      end: new Date(new Date(c.data_hora).getTime() + 30*60000),
      status: c.status,
      raw: c
    })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Agenda</h2>
        <button onClick={() => setOpenSchedule(true)} className="bg-blue-600 text-white px-3 py-1 rounded">Agendar</button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={event => setSelected(event.raw)}
        eventPropGetter={(event) => {
          const color = event.status === 'CONFIRMADA' ? 'green' : event.status === 'CANCELADA' ? 'gray' : 'blue'
          return { style: { backgroundColor: color, color: 'white' } }
        }}
      />

      {openSchedule && <ScheduleModal onClose={() => { setOpenSchedule(false); load() }} />}
      {selected && <DetailsModal consulta={selected} onClose={() => { setSelected(null); load() }} />}
    </div>
  )
}
