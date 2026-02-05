import { mutation } from "./_generated/server";

// Seed lessons for existing courses
export const seedLessons = mutation({
  handler: async (ctx) => {
    // Get all published courses
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    for (const course of courses) {
      // Check if lessons already exist
      const existingLessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect();

      if (existingLessons.length === 0) {
        // Add sample lessons based on course category
        let lessons = [];

        if (
          course.category.toLowerCase().includes("web") ||
          course.category.toLowerCase().includes("programming")
        ) {
          lessons = [
            {
              title: "Introduction to Web Development",
              description:
                "Learn the basics of web development and HTML fundamentals",
              duration: 15,
              order: 1,
              content:
                "<p>Welcome to web development! In this lesson, we'll cover the basic concepts.</p>",
            },
            {
              title: "HTML Document Structure",
              description:
                "Understanding the basic structure of HTML documents",
              duration: 20,
              order: 2,
              content:
                "<p>HTML documents have a specific structure that we'll explore.</p>",
            },
            {
              title: "CSS Styling Basics",
              description: "Introduction to styling with CSS",
              duration: 25,
              order: 3,
              content:
                "<p>CSS allows us to style our HTML elements beautifully.</p>",
            },
            {
              title: "JavaScript Fundamentals",
              description: "Learn the basics of JavaScript programming",
              duration: 30,
              order: 4,
              content:
                "<p>JavaScript brings interactivity to our web pages.</p>",
            },
            {
              title: "Building Your First Website",
              description: "Put it all together to create a complete website",
              duration: 45,
              order: 5,
              content:
                "<p>Let's combine HTML, CSS, and JavaScript to build something amazing!</p>",
            },
          ];
        } else if (course.category.toLowerCase().includes("design")) {
          lessons = [
            {
              title: "Design Principles",
              description: "Learn fundamental design principles and concepts",
              duration: 20,
              order: 1,
              content:
                "<p>Good design follows certain principles that we'll explore.</p>",
            },
            {
              title: "Color Theory",
              description: "Understanding color and how to use it effectively",
              duration: 25,
              order: 2,
              content:
                "<p>Color is one of the most powerful tools in design.</p>",
            },
            {
              title: "Typography Basics",
              description: "Learn about fonts and text styling",
              duration: 18,
              order: 3,
              content:
                "<p>Typography is the art and technique of arranging type.</p>",
            },
            {
              title: "Layout and Composition",
              description: "Creating balanced and effective layouts",
              duration: 30,
              order: 4,
              content:
                "<p>Learn how to arrange elements for maximum impact.</p>",
            },
          ];
        } else {
          // Generic lessons for other categories
          lessons = [
            {
              title: "Getting Started",
              description: `Introduction to ${course.title}`,
              duration: 15,
              order: 1,
              content: `<p>Welcome to ${course.title}! Let's get started with the basics.</p>`,
            },
            {
              title: "Core Concepts",
              description: "Understanding the fundamental concepts",
              duration: 25,
              order: 2,
              content:
                "<p>These core concepts will form the foundation of your learning.</p>",
            },
            {
              title: "Practical Applications",
              description: "Applying what you've learned in real scenarios",
              duration: 35,
              order: 3,
              content:
                "<p>Let's put theory into practice with real-world examples.</p>",
            },
            {
              title: "Advanced Techniques",
              description: "Exploring more advanced topics and techniques",
              duration: 40,
              order: 4,
              content: "<p>Ready to take your skills to the next level?</p>",
            },
          ];
        }

        // Insert lessons
        for (const lesson of lessons) {
          await ctx.db.insert("lessons", {
            courseId: course._id,
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            order: lesson.order,
            content: lesson.content,
            createdAt: Date.now(),
          });
        }

        console.log(
          `Added ${lessons.length} lessons for course: ${course.title}`,
        );
      }
    }

    return { message: "Lessons seeded successfully!" };
  },
});
