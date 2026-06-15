import React, { useState, useEffect } from 'react'
import { Shield, Users, FileText, BarChart3, Trash2, Edit3, Plus, X } from 'lucide-react'
import { getAllUsers, getArticles, createArticle, deleteArticle } from '../services/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '../utils/formatters'

const TABS = ['Overview', 'Users', 'Articles']

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [users, setUsers] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [articleForm, setArticleForm] = useState({ title: '', summary: '', content: '', category: 'climate_change', readTime: '5 min' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Admin Panel – EcoTrack'
    Promise.all([
      getAllUsers(20).then(({ users }) => setUsers(users)),
      getArticles(null, 20).then(({ articles }) => setArticles(articles)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreateArticle = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createArticle(articleForm)
      const { articles: refreshed } = await getArticles(null, 20)
      setArticles(refreshed)
      setShowArticleForm(false)
      setArticleForm({ title: '', summary: '', content: '', category: 'climate_change', readTime: '5 min' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return
    await deleteArticle(id)
    setArticles((a) => a.filter((x) => x.id !== id))
  }

  if (loading) return <div className="flex justify-center h-64 items-center"><LoadingSpinner size="lg" /></div>

  const totalEmissions = users.reduce((a, u) => a + (u.totalEmissions || 0), 0)
  const avgScore = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.sustainabilityScore || 0), 0) / users.length) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-violet-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-normal text-white nx-display">Admin Panel</h1>
          <p className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">Platform management and analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#262A34] border border-[#30354A] rounded-xl w-fit" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-['JetBrains_Mono',monospace] ${
              activeTab === tab
                ? 'bg-[#2D8CFF] text-white shadow-[0_0_12px_rgba(45,140,255,0.3)]'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',    value: users.length,                    icon: <Users    className="w-5 h-5 text-[#2D8CFF]" />, bg: 'bg-[#2D8CFF]/10' },
              { label: 'Total Articles', value: articles.length,                 icon: <FileText className="w-5 h-5 text-violet-400" />, bg: 'bg-violet-500/10' },
              { label: 'CO₂ Tracked',    value: `${Math.round(totalEmissions)} kg`, icon: <BarChart3 className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10' },
              { label: 'Avg Score',      value: `${avgScore}/100`,               icon: <Shield   className="w-5 h-5 text-amber-400" />, bg: 'bg-amber-500/10' },
            ].map(({ label, value, icon, bg }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`} aria-hidden="true">
                    {icon}
                  </div>
                  <div className="text-2xl font-bold text-white font-['JetBrains_Mono',monospace]">{value}</div>
                  <div className="text-xs text-[#A1A1AA] mt-0.5 font-['JetBrains_Mono',monospace] uppercase tracking-wide">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent users */}
          <Card>
            <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#30354A]">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="w-8 h-8 rounded-full gradient-eco flex items-center justify-center text-white text-sm font-bold" aria-hidden="true">
                      {u.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white font-['JetBrains_Mono',monospace]">{u.displayName || 'User'}</p>
                      <p className="text-xs text-[#A1A1AA] truncate font-['JetBrains_Mono',monospace]">{u.email}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'warning' : 'eco'}>{u.role || 'user'}</Badge>
                    <span className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                      {u.createdAt ? formatRelativeTime(u.createdAt) : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'Users' && (
        <Card>
          <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Users table">
                <thead>
                  <tr className="border-b border-[#30354A] bg-[#262A34]/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">Score</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">CO₂ Tracked</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#A1A1AA] font-['JetBrains_Mono',monospace] uppercase tracking-widest">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#30354A] hover:bg-[#262A34]/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full gradient-eco flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                            {u.displayName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-white font-['JetBrains_Mono',monospace]">{u.displayName || 'User'}</p>
                            <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'admin' ? 'warning' : 'eco'}>{u.role || 'user'}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#2D8CFF] font-['JetBrains_Mono',monospace]">{u.sustainabilityScore || 0}</td>
                      <td className="px-4 py-3 text-white font-['JetBrains_Mono',monospace]">{u.totalEmissions ? `${Math.round(u.totalEmissions)} kg` : '—'}</td>
                      <td className="px-4 py-3 text-[#A1A1AA] font-['JetBrains_Mono',monospace]">
                        {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles tab */}
      {activeTab === 'Articles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Articles ({articles.length})</h2>
            <Button variant="eco" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowArticleForm(true)} aria-label="Create new article">
              New Article
            </Button>
          </div>

          {showArticleForm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Create Article</CardTitle>
                <button onClick={() => setShowArticleForm(false)} aria-label="Close form" className="p-1.5 rounded-lg hover:bg-[#262A34] text-[#A1A1AA] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateArticle} className="space-y-4">
                  <Input id="article-title" label="Title" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} required />
                  <Textarea id="article-summary" label="Summary" value={articleForm.summary} onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })} />
                  <Textarea id="article-content" label="Content" value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} className="min-h-[120px]" />
                  <div className="grid grid-cols-2 gap-3">
                    <Select id="article-category" label="Category" value={articleForm.category} onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}>
                      <option value="climate_change">Climate Change</option>
                      <option value="renewable_energy">Renewable Energy</option>
                      <option value="waste_management">Waste Management</option>
                      <option value="sustainable_lifestyle">Sustainable Lifestyle</option>
                      <option value="carbon_neutrality">Carbon Neutrality</option>
                    </Select>
                    <Input id="article-readtime" label="Read Time" value={articleForm.readTime} onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })} placeholder="5 min" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowArticleForm(false)}>Cancel</Button>
                    <Button type="submit" variant="eco" loading={saving}>Publish Article</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card key={article.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{article.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="eco" className="text-xs capitalize">{article.category?.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{article.readTime || '5 min'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      aria-label={`Delete article: ${article.title}`}
                      className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
