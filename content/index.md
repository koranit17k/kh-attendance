::u-page-hero{title="ระบบตรวจสอบเวลาการทำงาน" }

::AttendanceSum
::

::u-page-section
:::div{class="grid grid-cols-2 gap-2 w-full"}
  ::AttendanceChart
  ::
  ::CompanyPieChart
  ::
:::
::

::Calendar{full}
::

::div{class="flex justify-center"}
:::u-button{color="neutral" size="xl" class="text-2xl px-8 py-4 mt-2 mx-auto flex w-fit" to="/attendance/report"}
enter site
:::
::


::u-page-section
#title
ข้อมูลทั่วไป

#features
:::u-page-feature
---
icon: i-simple-icons-nuxt
target: _blank
to: /workprocess/workflow
---
#title
[ขั้นตอนการทำงาน]{.text-primary .text-2xl}

#description
[แนวทางและลำดับขั้นตอนการทำงาน (Workflow)]{.text-xl}
:::

:::u-page-feature
---
icon: i-simple-icons-nuxt
target: _blank
to: https://ui.nuxt.com/docs/components
---
#title
[Nuxt.ui component]{.text-primary .text-2xl}

#description
[component ที่ใช้ในการพัฒนาซอฟแวร์]{.text-xl}
:::

:::u-page-feature
---
icon: i-simple-icons-nuxt
target: _blank
to: https://echarts.apache.org/en/index.html
---
#title
[Echarts]{.text-primary .text-2xl}

#description
[chart ที่ใช้ในการพัฒนาซอฟแวร์]{.text-xl}
:::
::

::div{class="flex flex-col items-center justify-center pt-8 pb-12"}
<counter class="text-xl"></counter>
<p class="text-gray-500 mt-2 text-xl">website visitor</p>
::