---
title: folder Structure
description: Project structure of attendance
navigation:
  icon: i-lucide-folder-tree
---

## Global structure


## Database Project Structure

```
├── 📁 docs                                    # Content
│   ├── 📝 1.workflow.md                       # Workflow
│   ├── 📝 2.reportdetails.md                  # Report Details
│   ├── 📝 3.exampledata.md                    # Example Data
│   ├── 📝 4.vitest.md                         # how to use test
│   ├── 📝 5.workflowreport.md                 # Report workflow
│   └── 📝 6.workflowhost.md                   # Host workflow
├── 📁 fonts                                   # Thai fonts used in report
├── 📁 img                                     # images
│   └── 🖼️ KEEHIN.png                          # logo
├── 📁 report                                  # Jasper Report
│   ├── 📄 A01.jrxml                           # Check Daily Time
│   ├── 📄 A02.jrxml                           # Check summary personal
│   ├── 📄 A03.jrxml                           # Check monthly summary
│   ├── 📄 A04.jrxml                           # Employee analysis report
│   └── 📄 A05.jrxml                           # Company analysis report
├── 📁 script                                  # Script
│   ├── 📄 backup.sh                           # Backup Database
│   ├── 📄 copyreport.sh                       # copy-paste report.jasper file for use
│   ├── 📄 restore.sh                          # Restore Database
│   └── 📄 runtest.sh                          # runtest by sql
├── 📁 sql                                     # SQL Script
│   ├── 📁 sqltest                             # test accuracy by sql
│   │   ├── 📄 1.seed_test_data.sql            # Create test data
│   │   ├── 📄 2.check_results.sql             # Check test data
│   │   └── 📄 3.cleartest.sql                 # Clear test data
│   ├── 📁 storage                             # Storage sql
│   │   ├── 📄 insert_and_clean_emp.sql        # insert new employee, update all emp to 1, clean who aren't working.
│   │   ├── 📄 insert_attendance.sql           # insert time data
│   │   ├── 📄 myviewtranslate.sql             # calculate view before myview
│   │   └── 📄 update_attendance.sql           # update calculate view to attendance
│   ├── 📄 1.database.sql                      # Create Database & User
│   ├── 📄 2.table.sql                         # Create Table
│   ├── 📄 3.view.sql                          # Create View
│   ├── 📄 4.myview.sql                        # Create view for use calculator
│   ├── 📄 5.procedure.sql                     # Procedure sql before autorun
│   ├── 📄 6.setup_autorun.sql                 # Setup autorun
│   └── 📄 7.check_autorun.sql                 # Check autorun
├── 📁 test                                    # accuracy test
│   ├── 📄 att.test.js                         # attendance test
│   ├── 📄 sum.js                              # mock-up for test
│   └── 📄 sum.test.js                         # mock-up for test
├── ⚙️ .prettierrc                             # Prettier config format
├── 📝 README.md                               # README for Dev & Ai
├── 🌐 index.html                              # index page
├── 🎨 main.css                                # main css for index
├── 📄 main.js                                 # main js for index
└── ⚙️ package.json                            # package json
```