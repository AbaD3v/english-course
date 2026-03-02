"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Моковые данные для примера - в будущем будут приходить с сервера
const courses = [
  {
    id: 1,
    title: "English for IT Professionals",
    description: "Разговорный английский для разработчиков и QA.",
    progress: 75,
    lessons: 24,
    color: "from-blue-500/10 to-indigo-500/10",
  },
  {
    id: 2,
    title: "Business English Masterclass",
    description: "Переписка, звонки и презентации на английском.",
    progress: 30,
    lessons: 18,
    color: "from-emerald-500/10 to-teal-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Главная
          </h1>
          <p className="text-zinc-500 mt-1">
            С возвращением! Продолжайте обучение, где остановились.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all shadow-sm">
          <BookOpen className="size-4" />
          Все курсы
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Активные курсы", value: "2", icon: Target },
          { title: "Завершено уроков", value: "32", icon: BookOpen },
          { title: "Средний балл", value: "4.8", icon: Target },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </h2>
              <stat.icon className="size-5 text-zinc-400" />
            </div>
            <p className="text-4xl font-semibold mt-4 text-zinc-950 dark:text-zinc-50">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Courses Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Ваши курсы
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -4 }}
              className={cn(
                "group relative rounded-3xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-7 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg",
                "bg-gradient-to-br",
                course.color
              )}
            >
              <div className="flex flex-col h-full justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {course.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-950 dark:text-zinc-50">
                      Прогресс
                    </span>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-2 rounded-full bg-zinc-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {course.lessons} уроков
                    </span>
                    <a
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:gap-2.5 transition-all"
                    >
                      Продолжить
                      <ChevronRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}