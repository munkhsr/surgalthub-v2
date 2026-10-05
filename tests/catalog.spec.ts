import { test, expect } from "@playwright/test";
test("search, filters, price sort and empty-state reset", async ({ page }) => {
  await page.goto("/courses");
  await expect(page.locator(".course-card")).toHaveCount(7);
  await page.getByRole("button", { name: "IT & Технологи", exact: true }).click();
  await expect(page.locator(".course-card")).toHaveCount(1);
  await expect(page.locator(".course-card h3")).toHaveText("Вэб хөгжүүлэлтийн анхан шат");
  await page.getByRole("button", { name: "Бүгд", exact: true }).click();
  await page.getByRole("textbox", { name: "Сургалт хайх" }).fill("Хятад");
  await expect(page.locator(".course-card")).toHaveCount(1);
  await expect(page.locator(".course-card h3")).toHaveText("Хятад хэлний анхан шат");
  await page.getByRole("button", { name: "Хайлт: Хятад шүүлтүүрийг хасах" }).click();
  await expect(page.locator(".course-card")).toHaveCount(7);
  await page.getByRole("textbox", { name: "Сургалт хайх" }).fill("");
  await page.getByRole("combobox", { name: "Дүүрэг", exact: true }).selectOption("Хан-Уул");
  await expect(page.locator(".course-card")).toHaveCount(3);
  await page.getByRole("combobox", { name: "Эрэмбэлэх", exact: true }).selectOption("low");
  await expect(page.locator(".course-card h3").first()).toHaveText("Хүүхдийн бүтээлч зургийн дугуйлан");
  await page.getByRole("combobox", { name: "Хэлбэр", exact: true }).selectOption("Онлайн");
  await expect(page.getByText("Тохирох сургалт олдсонгүй")).toBeVisible();
  await page.getByRole("button", { name: "Шүүлтүүр арилгах" }).click();
  await expect(page.locator(".course-card")).toHaveCount(7);
});
test("hierarchy, level, time, age and grade remain independent", async ({ page }) => {
  await page.goto("/languages");
  await page.getByRole("link", { name: "Хятад хэл Сургалт үзэх" }).click();
  await expect(page).toHaveURL(/subcategory=/);
  expect(new URL(page.url()).searchParams.get("subcategory")).toBe("Хятад хэл");
  await page.getByRole("button", { name: "HSK", exact: true }).click();
  await page.getByRole("combobox", { name: "Түвшин", exact: true }).selectOption("Анхан");
  await page.getByRole("combobox", { name: "Хичээллэх цаг", exact: true }).selectOption("Орой");
  await page.getByRole("combobox", { name: "Төлбөрийн дээд хэмжээ", exact: true }).selectOption("300000");
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.goto("/courses?category=IT%20%26%20Технологи");
  await expect(page.getByRole("combobox", { name: "Дэд төрөл", exact: true })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Чиглэл / зорилго", exact: true })).toHaveCount(0);
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Бүгдийг цэвэрлэх" }).click();
  await expect(page.locator(".course-card")).toHaveCount(7);
  await page.getByRole("button", { name: "Хүүхдийн хөгжил", exact: true }).click();
  await page.getByRole("combobox", { name: "Нас", exact: true }).selectOption("9–12");
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.getByRole("button", { name: "ЕБС & Шалгалтын бэлтгэл", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Нас", exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Анги", exact: true }).selectOption("10–12");
  await expect(page.getByRole("combobox", { name: "Анги", exact: true })).toHaveValue("10–12");
});
test("save survives reload and can be removed", async ({ page }) => {
  await page.goto("/courses?q=Хятад");
  await page.getByRole("button", { name: "Сургалт хадгалах", exact: true }).click();
  await page.goto("/saved");
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".course-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Хадгалснаас хасах", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Хадгалсан сургалт байхгүй" })).toBeVisible();
});
test("detail, center navigation and unavailable auth remain honest", async ({ page }) => {
  await page.goto("/courses/chinese-beginners");
  await expect(page.getByRole("heading", { name: "Хятад хэлний анхан шат", exact: true })).toBeVisible();
  await expect(page.getByText("Жишээ сургалт. Бодит бүртгэл, төлбөр авахгүй.")).toBeVisible();
  await page.getByRole("link", { name: "Төвийн танилцуулга →" }).click();
  await expect(page.getByRole("heading", { name: "Хэлний академи", exact: true })).toBeVisible();
  await expect(page.locator(".course-card")).toHaveCount(2);
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Нэвтрэх", exact: true })).toBeDisabled();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Админ эрх шаардлагатай" })).toBeVisible();
});
test("all categories search, subcategory navigation and keyboard dismissal", async ({ page }) => {
  await page.goto("/");
  await page.locator(".all-category-toggle").click();
  await page.getByRole("searchbox", { name: "Ангилал хайх" }).fill("жолоо");
  await expect(page.locator(".category-dialog-row")).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Ангилал хайх" }).fill("xyz");
  await expect(page.getByText("Тохирох ангилал олдсонгүй.")).toBeVisible();
  await page.getByRole("searchbox", { name: "Ангилал хайх" }).fill("");
  await page.getByRole("dialog").getByRole("button", { name: "Гадаад хэл", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: /^Англи хэл/ })).toBeVisible();
  await page.getByRole("button", { name: "Бүх ангилал руу буцах" }).click();
  await expect(page.locator(".category-dialog-row")).toHaveCount(10);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".all-category-toggle")).toBeFocused();
  await page.locator(".all-category-toggle").click();
  await page.getByRole("dialog").getByRole("button", { name: "Гадаад хэл", exact: true }).click();
  await page.getByRole("searchbox", { name: "Дэд төрөл хайх" }).fill("Хятад");
  await page.getByRole("dialog").getByRole("link", { name: /^Хятад хэл/ }).click();
  await expect(page).toHaveURL(/subcategory=/);
  expect(new URL(page.url()).searchParams.get("subcategory")).toBe("Хятад хэл");
  await expect(page.locator(".course-card")).toHaveCount(1);
});

test("account design supports password visibility and recovery navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/login");
  await expect(page.locator(".auth-illustration")).toBeVisible();
  await expect.poll(() => page.locator(".auth-illustration").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const password = page.getByLabel("Нууц үг", { exact: true });
  await password.fill("sample-password");
  await page.getByRole("button", { name: "Нууц үг харах", exact: true }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Нууц үг нуух", exact: true }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("checkbox", { name: "Намайг санаарай" }).uncheck();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.screenshot({ path: "test-results/login-390.png", fullPage: true });
  await page.getByRole("button", { name: "Нууц үгээ мартсан уу?" }).click();
  await expect(page.getByRole("heading", { name: "Нууц үг сэргээх" })).toBeVisible();
  await expect(password).toHaveCount(0);
  await page.getByRole("button", { name: "← Нэвтрэх хэсэгт буцах" }).click();
  await expect(password).toBeVisible();
  await page.locator(".auth-tabs").getByRole("link", { name: "Бүртгүүлэх", exact: true }).click();
  await expect(page).toHaveURL(/register/);
  await page.goto("/reset-password");
  await expect(page.getByRole("button", { name: "Нууц үг шинэчлэх" })).toBeDisabled();
});

test("OAuth configuration and cancelled callbacks fail safely", async ({ page, request }) => {
  const response = await request.get("/api/auth/providers");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ providers: [], configured: false });
  await page.route("**/api/auth/providers", route => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
  await page.goto("/login");
  await expect(page.getByText("Нэвтрэх үйлчилгээтэй холбогдож чадсангүй. Хуудсыг шинэчлээд дахин оролдоорой.")).toBeVisible();
  for (const provider of ["Google", "Apple", "Facebook"]) {
    await expect(page.getByRole("button", { name: `${provider}-ээр нэвтрэх` })).toBeDisabled();
  }
  await page.goto("/auth/callback?error=access_denied#error_description=cancelled");
  await expect(page.getByRole("heading", { name: "Нэвтэрч чадсангүй" })).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/callback$/);
  await page.getByRole("link", { name: "Нэвтрэх хэсэгт буцах" }).click();
  await expect(page).toHaveURL(/login$/);
});

test("registration fields validate matching passwords and link policies", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/register");
  await expect(page.locator(".auth-tabs .selected")).toHaveText("Бүртгүүлэх");
  await expect.poll(() => page.locator(".auth-illustration").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  await page.getByLabel("Овог нэр", { exact: true }).fill("Бат-Эрдэнэ");
  await page.getByLabel("Имэйл хаяг", { exact: true }).fill("test@example.com");
  await page.getByLabel("Нууц үг", { exact: true }).fill("sample-password");
  const confirmation = page.getByLabel("Нууц үг давтах", { exact: true });
  await confirmation.fill("different-password");
  expect(await confirmation.evaluate((el: HTMLInputElement) => el.validity.customError)).toBe(true);
  await confirmation.fill("sample-password");
  expect(await confirmation.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
  await page.getByRole("button", { name: "Давтсан нууц үг харах" }).click();
  await expect(confirmation).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Давтсан нууц үг нуух" }).click();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByRole("link", { name: "Үйлчилгээний нөхцөл", exact: true })).toHaveAttribute("href", "/terms");
  await expect(page.getByRole("link", { name: "Нууцлалын бодлого", exact: true })).toHaveAttribute("href", "/privacy");
  await page.screenshot({ path: "test-results/register-390.png", fullPage: true });
  for (const route of ["/terms", "/privacy"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("mobile catalog scrolls categories without widening the page", async ({ page }) => {
  for (const width of [320, 390, 430, 760]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/courses?category=Гадаад%20хэл&subcategory=Англи%20хэл");
    await expect(page.locator(".language-catalog-nav strong")).toHaveText("Англи хэл");
    await page.goto("/courses?category=Гадаад%20хэл");
    await expect(page.getByRole("button", { name: "Гадаад хэл", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Бүгд", exact: true })).toBeInViewport({ ratio: 1 });
    expect(await page.locator(".category-tabs").evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Мэргэжил олгох & Ур чадвар", exact: true }).click();
    await expect(page.getByRole("button", { name: "Мэргэжил олгох & Ур чадвар", exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Хүүхдийн хөгжил", exact: true }).click();
    await page.getByRole("combobox", { name: "Нас", exact: true }).selectOption("9–12");
    await page.getByRole("combobox", { name: "Төлбөрийн дээд хэмжээ", exact: true }).selectOption("500000");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width === 390) await page.screenshot({ path: "test-results/catalog-mobile-390.png", fullPage: true });
  }
});

test("desktop and mobile layouts fit screen", async ({ page }) => {
  for (const width of [1440,1024,900,768,390,320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/courses", "/languages", "/courses/chinese-beginners", "/centers", "/register"]) {
      await page.goto(route);
      await expect(page.locator("h1:visible,h2:visible").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.goto("/");
    await expect(page.locator(".category-tile")).toHaveCount(6);
    await expect(page.locator(".category-tile").first()).toContainText("Гадаад хэл");
    await expect(page.locator(".category-tile h3")).toHaveText(["Гадаад хэл", "IT & Технологи", "ЕБС & Шалгалтын бэлтгэл", "Хүүхдийн хөгжил", "Бизнес & Мэргэжлийн хөгжил", "Бүх ангилал"]);
    await page.locator(".all-category-toggle").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".category-dialog-row")).toHaveCount(10);
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/categories-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", {name: "Ангиллын цонх хаах"}).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.locator(".course-card").first()).toBeVisible();
    if (width <= 390) {
      const cards = page.locator(".home-catalog .course-card");
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      expect(Math.abs(first!.y-second!.y)).toBeLessThan(2);
      await expect(page.locator(".hero")).toBeVisible();
      await expect(page.locator(".home-centers")).toBeVisible();
      await expect(page.locator(".benefit-strip")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Гар утасны цэс" })).toBeVisible();
    }
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
      await page.goto("/languages");
      await expect(page.locator(".language-art")).toBeVisible();
      await expect.poll(() => page.locator(".language-art").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      await page.screenshot({ path: `test-results/languages-${width}.png`, fullPage: true });
    }
  }
});
