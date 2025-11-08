require('dotenv').config()
require('rootpath')()
const { spawn } = require('child_process')
const path = require('path')
const CFonts = require('cfonts')
const chalk = require('chalk')
const figlet = require('figlet')
const os = require('os')
const { performance } = require('perf_hooks')

console.clear()

const unhandledRejections = new Map()

process.on('uncaughtException', (err) => {
    if (err.code === 'ENOMEM') {
        console.error(chalk.hex('#FF4E50').bold('⚠ Critical Error: Out of memory. Performing cleanup...'))
        Object.keys(require.cache).forEach((key) => delete require.cache[key])
        global.gc && global.gc()
    } else {
        console.error(chalk.hex('#FF4E50').bold('⚠ Uncaught Exception:'), err)
    }
})

process.on('unhandledRejection', (reason, promise) => {
    unhandledRejections.set(promise, reason)
    if (reason.code === 'ENOMEM') {
        console.error(chalk.hex('#FF4E50').bold('⚠ Memory Warning: Attempting recovery...'))
        Object.keys(require.cache).forEach((key) => delete require.cache[key])
    } else {
        console.log(chalk.hex('#F5A623').bold('⚠ Unhandled Rejection at:'), promise, chalk.hex('#F5A623').bold('reason:'), reason)
    }
})

process.on('rejectionHandled', (promise) => {
    unhandledRejections.delete(promise)
})

process.on('warning', (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        console.warn(chalk.hex('#F5A623').bold('⚠ Memory Leak Detected:'), warning.message)
    }
})

function getSystemStats() {
    return {
        memory: {
            total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            free: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
        },
        cpu: os.cpus()[0].model,
        uptime: (os.uptime() / 3600).toFixed(2) + ' hours',
        platform: os.platform()
    }
}

async function start() {
    const startTime = performance.now()
    let args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
    
    let p = spawn(process.argv[0], args, { 
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: {
            ...process.env,
            NODE_OPTIONS: '--max-old-space-size=4096'
        }
    })
    .on('message', data => {
        if (data === 'reset') {
            console.log(chalk.hex('#00C4CC').bold('\n🔄 Restarting MD SHOP...'))
            p.kill()
            delete p
            displayHeader().then(start)
        }
    })
    .on('exit', (code, signal) => {
        const endTime = performance.now()
        console.error(chalk.hex('#FF4E50').bold(`❌ Process exited after ${((endTime - startTime)/1000).toFixed(2)}s with code: ${code || signal}`))
        setTimeout(() => {                                                                                                    
            console.log(chalk.hex('#00C4CC').bold('\n🔄 Attempting to restart MD SHOP...'))
            displayHeader().then(start)
        }, 2000)
    })
}

async function displayHeader() {
    const gradient = await import('gradient-string')
    console.clear()

    const title = figlet.textSync('Shop_@1.0.0', {
        font: 'Ghost',
        horizontalLayout: 'full',
        verticalLayout: 'default',
        kerning: 'full'
    })

    const colors = ['#FF4E50', '#F5A623', '#00C4CC', '#8E2DE2']
    const titleLines = title.split('\n').map((line, i) => {
        const currentGradient = gradient.default([colors[i % colors.length], colors[(i + 1) % colors.length]])
        return currentGradient(line)
    }).join('\n')

    console.log(titleLines)

    const stats = getSystemStats()
    const version = '3.0.0'
    
    const borderTop = chalk.hex('#00C4CC').bold('╔' + '═'.repeat(78) + '╗')
    const borderBottom = chalk.hex('#00C4CC').bold('╚' + '═'.repeat(78) + '╝')
    const borderSide = chalk.hex('#00C4CC').bold('║')

    const info = [
        `${borderSide} ${chalk.hex('#F5A623').bold('🚀MD-Enggenring'.padEnd(76))} ${borderSide}`,
        `${borderSide} ${''.padEnd(76)} ${borderSide}`,
        `${borderSide} ${chalk.white('📦 Version:    ') + chalk.hex('#FF4E50').bold(version).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('🧠 CPU:       ') + chalk.hex('#00C4CC')(stats.cpu.split('@')[0].trim()).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('💾 Memory:    ') + chalk.hex('#8E2DE2')(`${stats.memory.usage} of ${stats.memory.total}`).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('🌐 Platform:  ') + chalk.hex('#F5A623')(stats.platform).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('⏱️ Uptime:    ') + chalk.hex('#00C4CC')(stats.uptime).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${''.padEnd(76)} ${borderSide}`,
        `${borderSide} ${chalk.white('👨‍💻 Creator:   ') + chalk.hex('#FF4E50').bold('Yilzi').padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('🔗 GitHub:    ') + chalk.hex('#00C4CC').underline('https://github.com/YilziiHCT').padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('🎥 YouTube:   ') + chalk.hex('#FF0000').underline('https://youtube.com/@yilziii').padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('📱 Telegram:  ') + chalk.hex('#0088CC').underline('https://t.me/Yilziiii').padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.white('💼 Title:     ') + chalk.hex('#F5A623')('Software Engineer').padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${''.padEnd(76)} ${borderSide}`,
        `${borderSide} ${chalk.hex('#FF4E50').bold('⏰ Started:   ') + chalk.hex('#00C4CC').bold(new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Jakarta',
            hour12: true,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })).padEnd(76 - 15)} ${borderSide}`,
        `${borderSide} ${chalk.hex('#F5A623').bold('📢 Status:    Initializing subsystems...'.padEnd(76))} ${borderSide}`
    ]

    console.log(borderTop)
    for (let line of info) {
        console.log(line)
        await new Promise(resolve => setTimeout(resolve, 50))
    }
    console.log(borderBottom)

    CFonts.say('YILZI DEV', {
        font: 'chrome',
        align: 'center',
        colors: ['#FF00FF', '#00FFFF'],
        background: 'transparent',
        letterSpacing: 2,
        lineHeight: 2,
        space: true,
        gradient: true,
        independentGradient: true,
        transitionGradient: true
    })

    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let i = 0
    const statusInterval = setInterval(() => {
        process.stdout.write(`\r${chalk.bgHex('#00C4CC').black.bold(` ${frames[i]} STATUS: INITIALIZING `)}${chalk.hex('#FF4E50')(' ▶ ')}`)
        i = (i + 1) % frames.length
    }, 100)

    return new Promise(resolve => {
        setTimeout(() => {
            clearInterval(statusInterval)
            resolve()
        }, 1000)
    })
}

const major = parseInt(process.versions.node.split('.')[0], 10)
if (major < 20) {
    console.clear()
    const separator = chalk.hex('#FF4E50').bold('═'.repeat(70))
    const errorTitle = chalk.hex('#FF0000').bold(figlet.textSync('ERROR', { font: 'Small' }))
    
    console.log(separator)
    console.log(errorTitle)
    console.log()
    console.log(chalk.white('This application requires ') + chalk.hex('#00C4CC').bold('Node.js 20+') + chalk.white(' to run optimally.'))
    console.log(chalk.white('Current version installed: ') + chalk.hex('#FF4E50').bold(process.versions.node))
    console.log()
    console.log(chalk.hex('#F5A623')('Recommended installation methods:'))
    console.log(chalk.hex('#00C4CC')('• Using nvm: ') + chalk.white('nvm install 20 && nvm use 20'))
    console.log(chalk.hex('#8E2DE2')('• Direct download: ') + chalk.white('https://nodejs.org/en/download/'))
    console.log(separator)
    process.exit(1)
}

displayHeader().then(() => {
    console.log(chalk.hex('#00C4CC').bold('\n✅ Initialization complete. Starting MD...\n'))
    start()
})