import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, Mail, Phone, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';

const MOCK = [
  { id:1, name:'Dr. R. Sharma', code:'FAC001', email:'rsharma@bit.edu', phone:'9876543210', subjects:['OS','DBMS'], sections:['III-A','III-B'], sessionsThisMonth:24, avgPresent:87 },
  { id:2, name:'Prof. K. Priya', code:'FAC002', email:'kpriya@bit.edu', phone:'9876543211', subjects:['CN','SE'],   sections:['III-A','IV-A'], sessionsThisMonth:18, avgPresent:91 },
  { id:3, name:'Dr. M. Kumar',   code:'FAC003', email:'mkumar@bit.edu', phone:'9876543212', subjects:['AI','ML'],   sections:['IV-A','IV-B'], sessionsThisMonth:20, avgPresent:78 },
  { id:4, name:'Prof. S. Devi',  code:'FAC004', email:'sdevi@bit.edu',  phone:'9876543213', subjects:['DS','COA'],  sections:['II-A','II-B'], sessionsThisMonth:22, avgPresent:85 },
];

export default function FacultyOverview() {
  const [faculty, setFaculty] = useState(MOCK);
  const [search, setSearch] = useState('');

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Users className="w-6 h-6 text-purple-500" />Faculty Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            All faculty members in your department with allocation and activity summary.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input placeholder="Search faculty…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 w-64" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Faculty', value: faculty.length, icon: Users, color:'indigo' },
          { label:'Avg Sessions/Month', value: Math.round(faculty.reduce((a,f)=>a+f.sessionsThisMonth,0)/faculty.length), icon: BookOpen, color:'emerald' },
          { label:'Avg Class Attendance', value: Math.round(faculty.reduce((a,f)=>a+f.avgPresent,0)/faculty.length)+'%', icon: GraduationCap, color:'amber' },
          { label:'Subjects Assigned', value: faculty.reduce((a,f)=>a+f.subjects.length,0), icon: Filter, color:'purple' },
        ].map(stat => (
          <Card key={stat.label} className="glass-panel border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Faculty Table */}
      <Card className="glass-panel border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-800 dark:border-slate-800">
          <CardTitle className="text-base">Department Faculty Directory</CardTitle>
          <CardDescription>{filtered.length} faculty members</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full erp-table">
              <thead>
                <tr>
                  <th className="text-left">Faculty</th>
                  <th className="text-left">Subjects</th>
                  <th className="text-left">Sections</th>
                  <th className="text-center">Sessions This Month</th>
                  <th className="text-center">Avg Attendance</th>
                  <th className="text-right">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <motion.tr key={f.id} initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:i*0.05}}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {f.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{f.name}</p>
                          <p className="text-xs text-slate-500">{f.code}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {f.subjects.map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-500/20 font-medium">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {f.sections.map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{f.sessionsThisMonth}</span>
                    </td>
                    <td className="text-center">
                      <span className={`font-bold ${f.avgPresent >= 85 ? 'text-emerald-600' : f.avgPresent >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {f.avgPresent}%
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`mailto:${f.email}`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </a>
                        <a href={`tel:${f.phone}`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
