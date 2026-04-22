<template>
  <div class="app">
    <header class="header">
      <h1>🏥 医疗预约挂号平台</h1>
    </header>

    <div class="container">
      <nav class="nav">
        <button 
          class="nav-btn" 
          :class="{ active: currentView === 'home' }"
          @click="currentView = 'home'"
        >
          🏠 首页
        </button>
        <button 
          class="nav-btn" 
          :class="{ active: currentView === 'doctors' }"
          @click="currentView = 'doctors'"
        >
          👨‍⚕️ 医生查询
        </button>
        <button 
          class="nav-btn" 
          :class="{ active: currentView === 'appointments' }"
          @click="currentView = 'appointments'"
        >
          📋 就诊提醒
        </button>
        <button 
          class="nav-btn" 
          :class="{ active: currentView === 'clinic' }"
          @click="currentView = 'clinic'"
        >
          🏪 诊所管理
        </button>
      </nav>

      <!-- 首页 -->
      <div v-if="currentView === 'home'">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ doctors.length }}</div>
            <div class="stat-label">医生总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ pendingAppointments.length }}</div>
            <div class="stat-label">待就诊预约</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ departments.length }}</div>
            <div class="stat-label">科室数量</div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">📋 近期就诊提醒</h2>
          <div v-if="pendingAppointments.length > 0" class="appointment-list">
            <div 
              v-for="appointment in pendingAppointments.slice(0, 3)" 
              :key="appointment.id"
              class="appointment-card pending"
            >
              <div class="appointment-info">
                <h4>{{ appointment.doctorName }}</h4>
                <div class="appointment-time">{{ appointment.appointmentTime }}</div>
                <div class="appointment-doctor">{{ appointment.department }}</div>
              </div>
              <span class="appointment-status status-pending">待就诊</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无待就诊的预约</p>
            <button class="btn btn-primary" style="margin-top: 15px;" @click="currentView = 'doctors'">
              立即预约医生
            </button>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">🏪 诊所信息</h2>
          <div class="clinic-info">
            <h3>{{ clinicInfo.name }}</h3>
            <div class="clinic-detail address">{{ clinicInfo.address }}</div>
            <div class="clinic-detail phone">{{ clinicInfo.phone }}</div>
            <div class="clinic-detail hours">{{ clinicInfo.hours }}</div>
          </div>
        </div>
      </div>

      <!-- 医生查询与挂号 -->
      <div v-if="currentView === 'doctors'">
        <div class="card">
          <h2 class="card-title">🔍 医生查询</h2>
          <div class="search-section">
            <input 
              type="text" 
              v-model="searchKeyword" 
              class="search-input" 
              placeholder="搜索医生姓名、职称或专长..."
              @input="filterDoctors"
            />
            <select v-model="selectedDepartment" class="select-input" @change="filterDoctors">
              <option value="">全部科室</option>
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
            <button class="btn btn-primary" @click="filterDoctors">🔍 搜索</button>
          </div>

          <div v-if="filteredDoctors.length > 0" class="doctor-list">
            <div v-for="doctor in filteredDoctors" :key="doctor.id" class="doctor-card">
              <div class="doctor-header">
                <div class="doctor-avatar">
                  {{ doctor.gender === '男' ? '👨‍⚕️' : '👩‍⚕️' }}
                </div>
                <div class="doctor-info">
                  <h3>{{ doctor.name }}</h3>
                  <span class="doctor-title">{{ doctor.title }}</span>
                </div>
              </div>
              <div class="doctor-department">
                <strong>科室：</strong>{{ doctor.department }}
              </div>
              <div class="doctor-specialty">
                <strong>专长：</strong>{{ doctor.specialty }}
              </div>
              <div class="doctor-actions">
                <button class="btn btn-primary" @click="openAppointmentModal(doctor)">
                  📅 预约挂号
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>未找到匹配的医生</p>
          </div>
        </div>
      </div>

      <!-- 就诊提醒 -->
      <div v-if="currentView === 'appointments'">
        <div class="card">
          <h2 class="card-title">📋 就诊提醒</h2>
          <div v-if="appointments.length > 0" class="appointment-list">
            <div 
              v-for="appointment in appointments" 
              :key="appointment.id"
              class="appointment-card"
              :class="appointment.status"
            >
              <div class="appointment-info">
                <h4>{{ appointment.doctorName }} - {{ appointment.department }}</h4>
                <div class="appointment-time">{{ appointment.appointmentTime }}</div>
                <div class="appointment-doctor">预约时间：{{ appointment.createdAt }}</div>
              </div>
              <div style="display: flex; gap: 10px; align-items: center;">
                <span 
                  class="appointment-status"
                  :class="appointment.status === 'pending' ? 'status-pending' : 'status-completed'"
                >
                  {{ appointment.status === 'pending' ? '待就诊' : '已完成' }}
                </span>
                <button 
                  v-if="appointment.status === 'pending'"
                  class="btn btn-success"
                  style="padding: 8px 16px; font-size: 12px;"
                  @click="completeAppointment(appointment.id)"
                >
                  ✓ 完成
                </button>
                <button 
                  class="btn btn-danger"
                  style="padding: 8px 16px; font-size: 12px;"
                  @click="cancelAppointment(appointment.id)"
                >
                  ✕ 取消
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无预约记录</p>
            <button class="btn btn-primary" style="margin-top: 15px;" @click="currentView = 'doctors'">
              立即预约医生
            </button>
          </div>
        </div>
      </div>

      <!-- 诊所管理 -->
      <div v-if="currentView === 'clinic'">
        <div class="card">
          <h2 class="card-title">🏪 诊所信息</h2>
          <div class="clinic-info">
            <h3>{{ clinicInfo.name }}</h3>
            <div class="clinic-detail address">{{ clinicInfo.address }}</div>
            <div class="clinic-detail phone">{{ clinicInfo.phone }}</div>
            <div class="clinic-detail hours">{{ clinicInfo.hours }}</div>
          </div>
          <button class="btn btn-primary" @click="isEditingClinic = true">
            ✏️ 编辑诊所信息
          </button>
        </div>

        <div class="card">
          <h2 class="card-title">📊 预约统计</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ appointments.length }}</div>
              <div class="stat-label">总预约数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ pendingAppointments.length }}</div>
              <div class="stat-label">待就诊</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ completedAppointments.length }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约挂号弹窗 -->
    <div v-if="showAppointmentModal" class="modal-overlay" @click.self="closeAppointmentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📅 预约挂号</h3>
          <button class="modal-close" @click="closeAppointmentModal">&times;</button>
        </div>

        <div v-if="selectedDoctor">
          <div class="doctor-card" style="margin-bottom: 20px; background: #f5f7fa;">
            <div class="doctor-header">
              <div class="doctor-avatar">
                {{ selectedDoctor.gender === '男' ? '👨‍⚕️' : '👩‍⚕️' }}
              </div>
              <div class="doctor-info">
                <h3>{{ selectedDoctor.name }}</h3>
                <span class="doctor-title">{{ selectedDoctor.title }}</span>
              </div>
            </div>
            <div class="doctor-department">
              <strong>科室：</strong>{{ selectedDoctor.department }}
            </div>
            <div class="doctor-specialty">
              <strong>专长：</strong>{{ selectedDoctor.specialty }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">患者姓名</label>
            <input 
              type="text" 
              v-model="appointmentForm.patientName" 
              class="form-input" 
              placeholder="请输入患者姓名"
            />
          </div>

          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input 
              type="tel" 
              v-model="appointmentForm.phone" 
              class="form-input" 
              placeholder="请输入联系电话"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">预约日期</label>
              <input 
                type="date" 
                v-model="appointmentForm.date" 
                class="form-input"
                :min="today"
              />
            </div>
            <div class="form-group">
              <label class="form-label">预约时间</label>
              <select v-model="appointmentForm.time" class="form-input">
                <option value="">请选择时间</option>
                <option v-for="timeSlot in timeSlots" :key="timeSlot" :value="timeSlot">
                  {{ timeSlot }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">症状描述（选填）</label>
            <textarea 
              v-model="appointmentForm.symptoms" 
              class="form-input form-textarea"
              placeholder="请简要描述您的症状..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAppointmentModal">取消</button>
          <button class="btn btn-primary" @click="submitAppointment">确认预约</button>
        </div>
      </div>
    </div>

    <!-- 编辑诊所信息弹窗 -->
    <div v-if="isEditingClinic" class="modal-overlay" @click.self="isEditingClinic = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>✏️ 编辑诊所信息</h3>
          <button class="modal-close" @click="isEditingClinic = false">&times;</button>
        </div>

        <div class="form-group">
          <label class="form-label">诊所名称</label>
          <input 
            type="text" 
            v-model="clinicEditForm.name" 
            class="form-input" 
            placeholder="请输入诊所名称"
          />
        </div>

        <div class="form-group">
          <label class="form-label">诊所地址</label>
          <input 
            type="text" 
            v-model="clinicEditForm.address" 
            class="form-input" 
            placeholder="请输入诊所地址"
          />
        </div>

        <div class="form-group">
          <label class="form-label">联系电话</label>
          <input 
            type="tel" 
            v-model="clinicEditForm.phone" 
            class="form-input" 
            placeholder="请输入联系电话"
          />
        </div>

        <div class="form-group">
          <label class="form-label">营业时间</label>
          <input 
            type="text" 
            v-model="clinicEditForm.hours" 
            class="form-input" 
            placeholder="例如：周一至周日 08:00-18:00"
          />
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isEditingClinic = false">取消</button>
          <button class="btn btn-primary" @click="saveClinicInfo">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="fade">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const currentView = ref('home')
const searchKeyword = ref('')
const selectedDepartment = ref('')
const filteredDoctors = ref([])
const showAppointmentModal = ref(false)
const selectedDoctor = ref(null)
const isEditingClinic = ref(false)

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
]

const today = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

const defaultDoctors = [
  {
    id: 1,
    name: '张明华',
    gender: '男',
    title: '主任医师',
    department: '内科',
    specialty: '擅长心血管疾病、高血压、冠心病的诊断和治疗'
  },
  {
    id: 2,
    name: '李雪梅',
    gender: '女',
    title: '副主任医师',
    department: '儿科',
    specialty: '擅长儿童常见病、多发病的诊治，尤其是呼吸系统疾病'
  },
  {
    id: 3,
    name: '王建国',
    gender: '男',
    title: '主任医师',
    department: '外科',
    specialty: '擅长普外科常见疾病的手术治疗，如疝气、阑尾炎等'
  },
  {
    id: 4,
    name: '陈美玲',
    gender: '女',
    title: '副主任医师',
    department: '妇科',
    specialty: '擅长妇科炎症、月经不调、更年期综合征等疾病的诊治'
  },
  {
    id: 5,
    name: '刘伟强',
    gender: '男',
    title: '主治医师',
    department: '骨科',
    specialty: '擅长骨折、关节脱位、腰椎间盘突出等骨科疾病的诊治'
  },
  {
    id: 6,
    name: '赵晓燕',
    gender: '女',
    title: '主治医师',
    department: '皮肤科',
    specialty: '擅长湿疹、皮炎、痤疮等常见皮肤病的诊断和治疗'
  },
  {
    id: 7,
    name: '孙志强',
    gender: '男',
    title: '主任医师',
    department: '眼科',
    specialty: '擅长白内障、青光眼、近视等眼部疾病的诊治'
  },
  {
    id: 8,
    name: '周丽萍',
    gender: '女',
    title: '副主任医师',
    department: '耳鼻喉科',
    specialty: '擅长鼻炎、咽炎、中耳炎等耳鼻喉疾病的诊治'
  }
]

const defaultClinicInfo = {
  name: '康健综合诊所',
  address: '北京市朝阳区建国路88号',
  phone: '010-88888888',
  hours: '周一至周日 08:00-18:00'
}

const doctors = ref([])
const appointments = ref([])
const clinicInfo = ref({})

const clinicEditForm = ref({
  name: '',
  address: '',
  phone: '',
  hours: ''
})

const appointmentForm = ref({
  patientName: '',
  phone: '',
  date: '',
  time: '',
  symptoms: ''
})

const departments = computed(() => {
  const depts = [...new Set(doctors.value.map(d => d.department))]
  return depts.sort()
})

const pendingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'pending')
})

const completedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'completed')
})

const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const loadFromStorage = () => {
  try {
    const savedDoctors = localStorage.getItem('medical_doctors')
    const savedAppointments = localStorage.getItem('medical_appointments')
    const savedClinicInfo = localStorage.getItem('medical_clinic_info')

    if (savedDoctors) {
      doctors.value = JSON.parse(savedDoctors)
    } else {
      doctors.value = defaultDoctors
      localStorage.setItem('medical_doctors', JSON.stringify(defaultDoctors))
    }

    if (savedAppointments) {
      appointments.value = JSON.parse(savedAppointments)
    } else {
      appointments.value = []
    }

    if (savedClinicInfo) {
      clinicInfo.value = JSON.parse(savedClinicInfo)
    } else {
      clinicInfo.value = defaultClinicInfo
      localStorage.setItem('medical_clinic_info', JSON.stringify(defaultClinicInfo))
    }

    filteredDoctors.value = doctors.value
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
    doctors.value = defaultDoctors
    clinicInfo.value = defaultClinicInfo
    appointments.value = []
    filteredDoctors.value = doctors.value
  }
}

const saveToStorage = () => {
  try {
    localStorage.setItem('medical_doctors', JSON.stringify(doctors.value))
    localStorage.setItem('medical_appointments', JSON.stringify(appointments.value))
    localStorage.setItem('medical_clinic_info', JSON.stringify(clinicInfo.value))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

const filterDoctors = () => {
  let result = doctors.value

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(doctor => 
      doctor.name.toLowerCase().includes(keyword) ||
      doctor.title.toLowerCase().includes(keyword) ||
      doctor.specialty.toLowerCase().includes(keyword) ||
      doctor.department.toLowerCase().includes(keyword)
    )
  }

  if (selectedDepartment.value) {
    result = result.filter(doctor => doctor.department === selectedDepartment.value)
  }

  filteredDoctors.value = result
}

const openAppointmentModal = (doctor) => {
  selectedDoctor.value = doctor
  appointmentForm.value = {
    patientName: '',
    phone: '',
    date: today.value,
    time: '',
    symptoms: ''
  }
  showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
  showAppointmentModal.value = false
  selectedDoctor.value = null
}

const submitAppointment = () => {
  if (!appointmentForm.value.patientName.trim()) {
    showToast('请输入患者姓名', 'error')
    return
  }
  if (!appointmentForm.value.phone.trim()) {
    showToast('请输入联系电话', 'error')
    return
  }
  if (!appointmentForm.value.date) {
    showToast('请选择预约日期', 'error')
    return
  }
  if (!appointmentForm.value.time) {
    showToast('请选择预约时间', 'error')
    return
  }

  const appointment = {
    id: Date.now(),
    doctorId: selectedDoctor.value.id,
    doctorName: selectedDoctor.value.name,
    department: selectedDoctor.value.department,
    patientName: appointmentForm.value.patientName,
    phone: appointmentForm.value.phone,
    appointmentTime: `${appointmentForm.value.date} ${appointmentForm.value.time}`,
    symptoms: appointmentForm.value.symptoms,
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN')
  }

  appointments.value.unshift(appointment)
  saveToStorage()
  closeAppointmentModal()
  showToast('预约挂号成功！', 'success')
  currentView.value = 'appointments'
}

const completeAppointment = (id) => {
  const index = appointments.value.findIndex(a => a.id === id)
  if (index !== -1) {
    appointments.value[index].status = 'completed'
    saveToStorage()
    showToast('预约已标记为完成', 'success')
  }
}

const cancelAppointment = (id) => {
  if (confirm('确定要取消这个预约吗？')) {
    appointments.value = appointments.value.filter(a => a.id !== id)
    saveToStorage()
    showToast('预约已取消', 'info')
  }
}

watch(isEditingClinic, (newVal) => {
  if (newVal) {
    clinicEditForm.value = { ...clinicInfo.value }
  }
})

const saveClinicInfo = () => {
  if (!clinicEditForm.value.name.trim()) {
    showToast('请输入诊所名称', 'error')
    return
  }
  if (!clinicEditForm.value.address.trim()) {
    showToast('请输入诊所地址', 'error')
    return
  }
  if (!clinicEditForm.value.phone.trim()) {
    showToast('请输入联系电话', 'error')
    return
  }

  clinicInfo.value = { ...clinicEditForm.value }
  saveToStorage()
  isEditingClinic.value = false
  showToast('诊所信息已更新', 'success')
}

onMounted(() => {
  loadFromStorage()
  filterDoctors()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
